const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/orderModel');

// Stripe requires raw body for webhook signature
const webhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // Raw body
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata.orderId;

    try {
      const order = await Order.findById(orderId);
      if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
          id: paymentIntent.id,
          status: paymentIntent.status,
          update_time: event.created,
          email_address: paymentIntent.receipt_email
        };
        await order.save();
        console.log(`Order ${orderId} marked as paid via webhook`);
      }
    } catch (err) {
      console.error(`Error updating order ${orderId}: ${err}`);
    }
  }

  res.json({ received: true });
};

module.exports = { webhook };