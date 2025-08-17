// Updated orderController.js
require('dotenv').config();
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { orderSchema } = require('../utils/validation');
const mongoose = require('mongoose');

const createOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { error } = orderSchema.validate(req.body);
    if (error) throw new Error(error.details[0].message);

    const { products, shippingAddress, paymentMethod } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      throw new Error('No products provided');
    }

    // Fetch real product data from DB
    const productIds = products.map(item => item.productId);
    const dbProducts = await Product.find({ _id: { $in: productIds } }).session(session);

    let totalPrice = 0;
    const orderProducts = products.map(item => {
      const dbProduct = dbProducts.find(p => p._id.toString() === item.productId.toString());
      if (!dbProduct) throw new Error(`Product ${item.productId} not found`);
      if (dbProduct.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${dbProduct.name}`);
      }
      totalPrice += dbProduct.price * item.quantity;
      return {
        product: dbProduct._id,
        quantity: item.quantity,
        price: dbProduct.price,
      };
    });

    const order = new Order({
      user: req.user.id,
      products: orderProducts,
      shippingAddress, // Now an object { street, city, postalCode, country, notes }
      paymentMethod,
      totalPrice,
    });
    await order.save({ session });

    if (paymentMethod === 'stripe') {
      const sessionData = await stripe.checkout.sessions.create(
        {
          payment_method_types: ['card'],
          line_items: orderProducts.map(item => ({
            price_data: {
              currency: 'usd',
              product_data: {
                name: dbProducts.find(p => p._id.toString() === item.product.toString()).name,
              },
              unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
          })),
          mode: 'payment',
          success_url: `${req.protocol}://${req.headers.host}/api/orders/success/{CHECKOUT_SESSION_ID}`,
          cancel_url: `${req.headers.origin}/checkout`,
          metadata: { orderId: order._id.toString() },
        },
        { idempotencyKey: order._id.toString() }
      );

      await session.commitTransaction();
      return res.json({
        orderId: order._id,
        totalPrice,
        checkoutUrl: sessionData.url,
      });
    }

    await session.commitTransaction();
    res.json({ orderId: order._id, totalPrice });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

const updateOrderToPaid = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = req.body.paymentResult;
    await order.save();

    res.json({ orderId: order._id });
  } catch (err) {
    next(err);
  }
};

const getOrders = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'user') {
      query.user = req.user.id;
    } else if (req.user.role === 'admin') {
      const adminProducts = await Product.find({ createdBy: req.user.id }).select('_id');
      const productIds = adminProducts.map(p => p._id);
      if (productIds.length > 0) {
        query['products.product'] = { $in: productIds };
      } else {
        return res.json([]);
      }
    } // superadmin: no filter
    const orders = await Order.find(query).populate('user products.product');
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    if (!req.params.id || req.params.id === 'undefined') {
      return res.status(400).json({ message: 'Invalid order ID' });
    }
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
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (req.user.role === 'admin') {
      const adminProducts = await Product.find({ createdBy: req.user.id }).select('_id');
      const productIds = adminProducts.map(p => p._id);
      const orderProductIds = order.products.map(op => op.product);
      const hasOwnProduct = orderProductIds.some(opid => productIds.some(pid => pid.toString() === opid.toString()));
      if (!hasOwnProduct) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedOrder);
  } catch (err) {
    next(err);
  }
};

const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (req.user.role === 'admin') {
      const adminProducts = await Product.find({ createdBy: req.user.id }).select('_id');
      const productIds = adminProducts.map(p => p._id);
      const orderProductIds = order.products.map(op => op.product);
      const hasOwnProduct = orderProductIds.some(opid => productIds.some(pid => pid.toString() === opid.toString()));
      if (!hasOwnProduct) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrder,
  updateOrderToPaid,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
};