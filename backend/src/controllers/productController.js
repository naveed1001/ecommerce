const Product = require('../models/productModel');
const { productSchema } = require('../utils/validation');

const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find().populate('category');
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
    console.log('Uploaded file:', req.file); // Debug

    const product = new Product({
      ...req.body,
      image: req.file ? `/uploads/${req.file.filename}` : null
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
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


module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, addReview };