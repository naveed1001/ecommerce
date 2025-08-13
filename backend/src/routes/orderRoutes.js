const express = require('express');
const { createOrder, updateOrderToPaid, getOrders, getOrderById, updateOrder, deleteOrder } = require('../controllers/orderController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', protect, createOrder);
router.post('/:id/pay', protect, updateOrderToPaid); // New route for payment confirmation
router.get('/', protect, admin, getOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id', protect, admin, updateOrder);
router.delete('/:id', protect, admin, deleteOrder);

module.exports = router;