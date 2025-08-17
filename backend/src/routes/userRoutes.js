// Updated userRoutes.js
const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, addToWishlist, removeFromWishlist, getAllUsers, deleteUser, updateUserRole } = require('../controllers/userController');
const { protect, admin, superadmin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, upload.single('profileImage'), updateUserProfile);
router.post('/wishlist', protect, addToWishlist);
router.delete('/wishlist/:productId', protect, removeFromWishlist);
router.get('/', protect, superadmin, getAllUsers);
router.delete('/:id', protect, superadmin, deleteUser);
router.put('/:id/role', protect, superadmin, updateUserRole);

module.exports = router;