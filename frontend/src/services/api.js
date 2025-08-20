import axios from 'axios';

// Determine API base URL from environment or fallback to browser origin
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (typeof window !== 'undefined'
    ? `${window.location.origin}/api`
    : 'http://localhost:5000/api');

const API = axios.create({
  baseURL: API_BASE_URL
});

// Attach token to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle API errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// ---------- Auth ----------
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const verifyOTP = (data) => API.post('/auth/verify-otp', data);
export const resendOTP = (data) => API.post('/auth/resend-otp', data);

// ---------- Products ----------
export const getProducts = () => API.get('/products');
export const getProduct = (id) => API.get(`/products/${id}`);
export const getProductsByRole = () => API.get('/products/manage');
export const createProduct = (data) => API.post('/products', data);
export const updateProduct = (id, data) => API.put(`/products/${id}`, data);
export const deleteProduct = (id) => API.delete(`/products/${id}`);
export const addReview = (id, data) => API.post(`/products/${id}/reviews`, data);

// ---------- Categories ----------
export const getCategories = () => API.get('/categories');
export const createCategory = (data) => API.post('/categories', data);
export const updateCategory = (id, data) => API.put(`/categories/${id}`, data);
export const deleteCategory = (id) => API.delete(`/categories/${id}`);

// ---------- Orders ----------
export const createOrder = (data) => API.post('/orders', data);
export const getOrders = () => API.get('/orders');
export const getOrderById = (id) => API.get(`/orders/${id}`);
export const updateOrder = (id, data) => API.put(`/orders/${id}`, data);
export const deleteOrder = (id) => API.delete(`/orders/${id}`);
export const updateOrderToPaid = (id, paymentResult) =>
  API.post(`/orders/${id}/pay`, { paymentResult });

// ---------- Users ----------
export const getUserProfile = () => API.get('/users/profile');
export const updateUserProfile = (data) => API.put('/users/profile', data);
export const addToWishlist = (productId) => API.post('/users/wishlist', { productId });
export const removeFromWishlist = (productId) => API.delete(`/users/wishlist/${productId}`);
export const getAllUsers = () => API.get('/users');
export const deleteUser = (id) => API.delete(`/users/${id}`);
export const updateUserRole = (id, role) => API.put(`/users/${id}/role`, { role });

export default API;