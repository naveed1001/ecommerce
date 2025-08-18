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
const { handleStripeSuccess } = require('../controllers/stripeController'); // Import the new controller function

// Routes
router.post('/', protect, createOrder);
router.post('/:id/pay', protect, updateOrderToPaid);
router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id', protect, admin, updateOrder);
router.delete('/:id', protect, admin, deleteOrder);

// Success callback for Stripe Checkout
router.get('/success/:session_id', handleStripeSuccess);

module.exports = router;