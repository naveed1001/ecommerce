const Order = require('../models/orderModel');
const Product = require('../models/productModel'); // Added for price fetching
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { orderSchema } = require('../utils/validation');

const createOrder = async (req, res, next) => {
  const { error } = orderSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const { products, shippingAddress, paymentMethod } = req.body;

    // Fetch real products from DB to calculate total (prevent tampering)
    const productIds = products.map(item => item.product._id);
    const dbProducts = await Product.find({ _id: { $in: productIds } });

    let totalPrice = 0;
    const orderProducts = products.map(item => {
      const dbProduct = dbProducts.find(p => p._id.toString() === item.product._id);
      if (!dbProduct) throw new Error(`Product ${item.product._id} not found`);
      totalPrice += dbProduct.price * item.quantity;
      return { product: dbProduct._id, quantity: item.quantity };
    });

    const order = new Order({
      user: req.user.id,
      products: orderProducts,
      shippingAddress,
      paymentMethod,
      totalPrice
    });
    await order.save();

    if (paymentMethod === 'stripe') {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalPrice * 100), // cents, round to avoid floats
        currency: 'usd',
        metadata: { orderId: order._id.toString() } // For webhook identification
      });
      res.json({ clientSecret: paymentIntent.client_secret, order });
    } else {
      res.json(order);
    }
  } catch (err) {
    next(err);
  }
};

const updateOrderToPaid = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Verify it's the user's order
    if (order.user.toString() !== req.user.id) return res.status(403).json({ message: 'Access denied' });

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = req.body.paymentResult; // From Stripe confirmation
    await order.save();

    res.json(order);
  } catch (err) {
    next(err);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().populate('user products.product');
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user products.product');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
};

const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createOrder, updateOrderToPaid, getOrders, getOrderById, updateOrder, deleteOrder };