require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const mongoose = require('mongoose');

const handleStripeSuccess = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const stripeSession = await stripe.checkout.sessions.retrieve(req.params.session_id);

    if (!stripeSession.metadata.orderId) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Order ID missing in session metadata' });
    }

    if (stripeSession.payment_status === 'paid' || stripeSession.status === 'complete') {
      const order = await Order.findById(stripeSession.metadata.orderId).session(session);
      if (!order) {
        await session.abortTransaction();
        return res.status(404).json({ message: 'Order not found' });
      }

      // Update stock for each product in the order
      for (const item of order.products) {
        const product = await Product.findById(item.product).session(session);
        if (!product) {
          await session.abortTransaction();
          return res.status(404).json({ message: `Product ${item.product} not found` });
        }
        if (product.stock < item.quantity) {
          await session.abortTransaction();
          return res.status(400).json({ message: `Insufficient stock for product ${product.name}` });
        }
        product.stock -= item.quantity;
        await product.save({ session });
      }

      // Update order to paid
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: stripeSession.payment_intent,
        status: stripeSession.payment_status,
        update_time: stripeSession.created,
        email_address: stripeSession.customer_details?.email || '',
      };
      await order.save({ session });

      await session.commitTransaction();
      const redirectUrl = `${req.headers.origin || 'http://localhost:3000'}/order/${order._id}`;
      res.setHeader('Cache-Control', 'no-store');
      res.redirect(302, redirectUrl);
    } else {
      await session.abortTransaction();
      const errorUrl = `${req.headers.origin || 'http://localhost:3000'}/checkout?error=payment_failed`;
      res.setHeader('Cache-Control', 'no-store');
      res.redirect(302, errorUrl);
    }
  } catch (err) {
    await session.abortTransaction();
    const errorUrl = `${req.headers.origin || 'http://localhost:3000'}/checkout?error=server_error`;
    res.setHeader('Cache-Control', 'no-store');
    res.redirect(302, errorUrl);
  } finally {
    session.endSession();
  }
};

module.exports = { handleStripeSuccess };