const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
  category: Joi.string().allow(null, ''),
  stock: Joi.number()
});

const categorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required()
});

const reviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().required()
});

const orderSchema = Joi.object({
  user: Joi.string().required(), // user ObjectId
  products: Joi.array()
    .items(
      Joi.object({
        product: Joi.string().required(), // product ObjectId
        quantity: Joi.number().integer().min(1).required()
      })
    )
    .min(1)
    .required(),
  shippingAddress: Joi.string().required(),
  paymentMethod: Joi.string().required(),
  paymentResult: Joi.object({
    id: Joi.string().optional(),
    status: Joi.string().optional(),
    update_time: Joi.string().optional(),
    email_address: Joi.string().email().optional()
  }).optional(),
  totalPrice: Joi.number().positive().required(),
  isPaid: Joi.boolean().optional(),
  paidAt: Joi.date().optional(),
  isDelivered: Joi.boolean().optional(),
  deliveredAt: Joi.date().optional()
});

const userUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  role: Joi.string().valid('user', 'admin').optional(),
  wishlist: Joi.array().items(Joi.string()).optional(), // product IDs
  orders: Joi.array().items(Joi.string()).optional() // order IDs
}).min(1); // ensure at least one field is being updated


module.exports = { registerSchema, loginSchema, productSchema, categorySchema, orderSchema, userUpdateSchema, reviewSchema };