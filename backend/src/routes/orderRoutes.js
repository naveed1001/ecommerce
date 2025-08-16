// orderRoutes.js
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const {
  createOrder,
  updateOrderToPaid,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} = require('../controllers/orderController');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/orderModel');
const Product = require('../models/productModel'); // Add Product model import
const mongoose = require('mongoose'); // Add mongoose import for transactions

// Routes
router.post('/', protect, createOrder);
router.post('/:id/pay', protect, updateOrderToPaid);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id', protect, admin, updateOrder);
router.delete('/:id', protect, admin, deleteOrder);

// Success callback for Stripe Checkout
router.get('/success/:session_id', async (req, res, next) => {
  const session = await mongoose.startSession(); // Start a transaction session
  session.startTransaction();
  try {
    const stripeSession = await stripe.checkout.sessions.retrieve(req.params.session_id);
    console.log('Stripe session:', {
      sessionId: stripeSession.id,
      payment_status: stripeSession.payment_status,
      status: stripeSession.status,
      orderId: stripeSession.metadata.orderId,
    });

    if (!stripeSession.metadata.orderId) {
      console.error('Missing orderId in session metadata', { sessionId: req.params.session_id });
      await session.abortTransaction();
      return res.status(400).json({ message: 'Order ID missing in session metadata' });
    }

    if (stripeSession.payment_status === 'paid' || stripeSession.status === 'complete') {
      const order = await Order.findById(stripeSession.metadata.orderId).session(session);
      if (!order) {
        console.error('Order not found', { orderId: stripeSession.metadata.orderId });
        await session.abortTransaction();
        return res.status(404).json({ message: 'Order not found' });
      }

      // Update stock for each product in the order
      for (const item of order.products) {
        const product = await Product.findById(item.product).session(session);
        if (!product) {
          console.error('Product not found', { productId: item.product });
          await session.abortTransaction();
          return res.status(404).json({ message: `Product ${item.product} not found` });
        }
        if (product.stock < item.quantity) {
          console.error('Insufficient stock', { productId: item.product, stock: product.stock, quantity: item.quantity });
          await session.abortTransaction();
          return res.status(400).json({ message: `Insufficient stock for product ${product.name}` });
        }
        product.stock -= item.quantity; // Decrease stock
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

      console.log('Order updated to paid and stock updated', { orderId: stripeSession.metadata.orderId });

      await session.commitTransaction();
      // Redirect to frontend order details page
      const redirectUrl = `${req.headers.origin || 'http://localhost:3000'}/order/${order._id}`;
      console.log('Redirecting to:', redirectUrl);
      res.setHeader('Cache-Control', 'no-store');
      res.redirect(302, redirectUrl);
    } else {
      console.log('Payment not successful', {
        payment_status: stripeSession.payment_status,
        session_status: stripeSession.status,
      });
      await session.abortTransaction();
      const errorUrl = `${req.headers.origin || 'http://localhost:3000'}/checkout?error=payment_failed`;
      res.setHeader('Cache-Control', 'no-store');
      res.redirect(302, errorUrl);
    }
  } catch (err) {
    console.error('Error in success callback:', {
      error: err.message,
      sessionId: req.params.session_id,
    });
    await session.abortTransaction();
    const errorUrl = `${req.headers.origin || 'http://localhost:3000'}/checkout?error=server_error`;
    res.setHeader('Cache-Control', 'no-store');
    res.redirect(302, errorUrl);
  } finally {
    session.endSession();
  }
});

module.exports = router;