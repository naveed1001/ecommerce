const Product = require('../models/productModel');
const { productSchema } = require('../utils/validation');


const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({}).populate('category');

    res.status(200).json({
      message: 'Products retrieved successfully',
      count: products.length,
      products
    });
  } catch (err) {
    next(err);
  }
};

const getProductsByRole = async (req, res, next) => {
  try {
    let query = {};

    // Only apply the filter if the request is for managing products and the user is an 'admin'
    if (req.user && req.user.role === 'admin') {
      query.createdBy = req.user.id;
    }

    const products = await Product.find(query).populate('category');

    res.status(200).json({
      message: 'Products retrieved successfully',
      count: products.length,
      products
    });
  } catch (err) {
    next(err);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

const createProduct = async (req, res, next) => {
  const { error } = productSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    console.log('Create product - Request body:', req.body); // Debug
    console.log('Create product - Uploaded file:', req.file); // Debug

    const product = new Product({
      ...req.body,
      image: req.file ? `/uploads/${req.file.filename}` : null,
      createdBy: req.user.id
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error('Create product error:', err); // Debug
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {

    // Validate request body
    const { error } = productSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    // Fetch existing product
    const existingProduct = await Product.findById(req.params.id);
    if (!existingProduct) return res.status(404).json({ message: 'Product not found' });

    if (req.user.role === 'admin' && existingProduct.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Prepare update data
    const updateData = {
      ...req.body,
      image: req.file ? `/uploads/${req.file.filename}` : existingProduct.image // Preserve existing image
    };

    // Update product
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('category');

    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json(product);
  } catch (err) {
    console.error('Update product error:', err); // Debug
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (req.user.role === 'admin' && product.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};

const addReview = async (req, res, next) => {
  const { rating, comment } = req.body;
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user.id);
    if (alreadyReviewed) return res.status(400).json({ message: 'Product already reviewed' });

    const review = { user: req.user.id, rating: Number(rating), comment };
    product.reviews.push(review);
    await product.save();
    res.status(201).json({ message: 'Review added', review });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProducts, getProductsByRole, getProductById, createProduct, updateProduct, deleteProduct, addReview };