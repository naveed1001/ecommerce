const express = require('express');
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, admin, superadmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', getCategories);
router.post('/', protect, admin, createCategory);
router.put('/:id', protect, superadmin, updateCategory);
router.delete('/:id', protect, superadmin, deleteCategory);

module.exports = router;