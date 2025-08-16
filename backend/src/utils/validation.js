const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  profileImage: Joi.any().optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
  category: Joi.string().allow(null, ''),
  stock: Joi.number(),
});

const categorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
});

const reviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().required(),
});

const orderSchema = Joi.object({
  user: Joi.string().optional(),
  products: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required(),
        quantity: Joi.number().integer().min(1).required(),
      })
    )
    .min(1)
    .required(),
  shippingAddress: Joi.object({
    street: Joi.string().trim().min(1).required(),
    city: Joi.string().trim().min(1).required(),
    postalCode: Joi.string().trim().min(1).required(),
    country: Joi.string().trim().min(1).required(),
    notes: Joi.string().trim().allow('').optional(),
  }).required(),
  paymentMethod: Joi.string().required(),
  paymentResult: Joi.object({
    id: Joi.string().optional(),
    status: Joi.string().optional(),
    update_time: Joi.string().optional(),
    email_address: Joi.string().email().optional(),
  }).optional(),
  totalPrice: Joi.number(),
  isPaid: Joi.boolean().optional(),
  paidAt: Joi.date().optional(),
  isDelivered: Joi.boolean().optional(),
  deliveredAt: Joi.date().optional(),
});

const userUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  role: Joi.string().valid('user', 'admin').optional(),
  profileImage: Joi.any().optional(),
  wishlist: Joi.array().items(Joi.string()).optional(),
  orders: Joi.array().items(Joi.string()).optional(),
}).min(1);

module.exports = {
  registerSchema,
  loginSchema,
  productSchema,
  categorySchema,
  orderSchema,
  userUpdateSchema,
  reviewSchema,
};