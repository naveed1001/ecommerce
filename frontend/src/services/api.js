import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});


// Update token on each request
API.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
  return config;
});

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);

// Products
export const getProducts = (params) => API.get('/products', { params });
export const getProduct = (id) => API.get(`/products/${id}`);
export const createProduct = (data) => API.post('/products', data);
export const updateProduct = (id, data) => API.put(`/products/${id}`, data);
export const deleteProduct = (id) => API.delete(`/products/${id}`);
export const addReview = (id, data) => API.post(`/products/${id}/reviews`, data);

// Categories
export const getCategories = () => API.get('/categories');
export const createCategory = (data) => API.post('/categories', data);
export const updateCategory = (id, data) => API.put(`/categories/${id}`, data);
export const deleteCategory = (id) => API.delete(`/categories/${id}`);

// Orders
export const createOrder = (data) => API.post('/orders', data);
export const getOrders = () => API.get('/orders');
export const getOrder = (id) => API.get(`/orders/${id}`);
export const updateOrder = (id, data) => API.put(`/orders/${id}`, data);
export const deleteOrder = (id) => API.delete(`/orders/${id}`);
export const updateOrderToPaid = (id, paymentResult) => API.post(`/orders/${id}/pay`, { paymentResult });

// Users
export const getUserProfile = () => API.get('/users/profile');
export const updateUserProfile = (data) => API.put('/users/profile', data);
export const addToWishlist = (productId) => API.post('/users/wishlist', { productId });
export const removeFromWishlist = (productId) => API.delete(`/users/wishlist/${productId}`);
export const getAllUsers = () => API.get('/users');
export const deleteUser = (id) => API.delete(`/users/${id}`);