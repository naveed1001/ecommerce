import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  getProducts, createProduct, updateProduct, deleteProduct,
  getCategories, createCategory, updateCategory, deleteCategory,
  getOrders, updateOrder, deleteOrder,
  getAllUsers, deleteUser, updateUserRole
} from '../services/api';
import ConfirmationModal from './ConfirmationModel';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', category: '', stock: 0, image: null });
  const [categoryForm, setCategoryForm] = useState({ name: '' });
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ itemType: '', itemId: '', itemName: '', onConfirm: () => {} });

  // Check admin or superadmin role
  useEffect(() => {
    if (!token || !['admin', 'superadmin'].includes(user?.role)) {
      navigate('/login');
    }
  }, [token, user, navigate]);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productRes, categoryRes, orderRes, userRes] = await Promise.all([
          getProducts(),
          getCategories(),
          getOrders(),
          getAllUsers()
        ]);

        if (Array.isArray(productRes.data.products)) {
          setProducts(productRes.data.products);
        } else {
          setProducts([]);
          setError('Invalid product data received');
        }

        if (Array.isArray(categoryRes.data)) {
          setCategories(categoryRes.data);
        } else {
          setCategories([]);
          setError('Invalid category data received');
        }

        if (Array.isArray(orderRes.data)) {
          setOrders(orderRes.data);
        } else {
          setOrders([]);
          setError('Invalid order data received');
        }

        if (Array.isArray(userRes.data)) {
          setUsers(userRes.data);
        } else {
          setUsers([]);
          setError('Invalid user data received');
        }
      } catch (err) {
        setError(err.message || 'Failed to load data');
        setProducts([]);
        setCategories([]);
        setOrders([]);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  // Handle product form submission
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.keys(productForm).forEach(key => {
      if (key === 'image' && productForm[key]) {
        formData.append(key, productForm[key]);
      } else if (productForm[key] !== '' && productForm[key] !== null) {
        formData.append(key, productForm[key]);
      }
    });

    try {
      if (editingProduct) {
        const res = await updateProduct(editingProduct._id, formData);
        setProducts(products.map(p => p._id === editingProduct._id ? res.data : p));
        setEditingProduct(null);
        setSuccess('Product updated successfully');
      } else {
        const res = await createProduct(formData);
        setProducts([...products, res.data]);
        setSuccess('Product created successfully');
      }
      setProductForm({ name: '', description: '', price: '', category: '', stock: 0, image: null });
      setError(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save product');
    }
  };

  // Handle category form submission
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const res = await updateCategory(editingCategory._id, categoryForm);
        setCategories(categories.map(c => c._id === editingCategory._id ? res.data : c));
        setEditingCategory(null);
        setSuccess('Category updated successfully');
      } else {
        const res = await createCategory(categoryForm);
        setCategories([...categories, res.data]);
        setSuccess('Category created successfully');
      }
      setCategoryForm({ name: '' });
      setError(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save category');
    }
  };

  // Handle product deletion
  const handleDeleteProduct = async (id) => {
    await deleteProduct(id);
    setProducts(products.filter(p => p._id !== id));
    setSuccess('Product deleted successfully');
    setTimeout(() => setSuccess(null), 3000);
  };

  // Handle category deletion
  const handleDeleteCategory = async (id) => {
    await deleteCategory(id);
    setCategories(categories.filter(c => c._id !== id));
    setSuccess('Category deleted successfully');
    setTimeout(() => setSuccess(null), 3000);
  };

  // Handle order deletion
  const handleDeleteOrder = async (id) => {
    await deleteOrder(id);
    setOrders(orders.filter(o => o._id !== id));
    setSuccess('Order deleted successfully');
    setTimeout(() => setSuccess(null), 3000);
  };

  // Handle user deletion
  const handleDeleteUser = async (id) => {
    await deleteUser(id);
    setUsers(users.filter(u => u.id !== id));
    setSuccess('User deleted successfully');
    setTimeout(() => setSuccess(null), 3000);
  };

  // Handle user role update
  const handleUpdateUserRole = async (id, role) => {
    try {
      const res = await updateUserRole(id, role);
      setUsers(users.map(u => u.id === id ? { ...u, role: res.data.role } : u));
      setSuccess(`User role updated to ${role}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update user role');
    }
  };

  // Open confirmation modal
  const openModal = (itemType, itemId, itemName, onConfirm) => {
    setModalConfig({ itemType, itemId, itemName, onConfirm });
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setModalConfig({ itemType: '', itemId: '', itemName: '', onConfirm: () => {} });
  };

  // Handle order status update
  const handleUpdateOrder = async (id, isDelivered) => {
    try {
      const res = await updateOrder(id, { isDelivered });
      setOrders(orders.map(o => o._id === id ? { ...o, isDelivered: res.data.isDelivered } : o));
      setSuccess(`Order marked as ${isDelivered ? 'delivered' : 'undelivered'}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update order status');
    }
  };

  // Handle edit product click
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category?._id || product.category || '',
      stock: product.stock || 0,
      image: null,
    });
  };

  // Handle cancel edit
  const handleCancelEditProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: '', description: '', price: '', category: '', stock: 0, image: null });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12 bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen font-inter">
        <div className="text-center py-10 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100">
          <p className="text-gray-600 text-base font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen font-inter">
      <h1 className="text-3xl font-bold text-center tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 mb-8">
        Your Dashboard
      </h1>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-xl shadow-md animate-slide-up">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-xl shadow-md animate-slide-up">
          {error}
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalOpen}
        onClose={closeModal}
        onConfirm={modalConfig.onConfirm}
        itemName={modalConfig.itemName}
        itemType={modalConfig.itemType}
        itemId={modalConfig.itemId}
      />

      {/* Product Management */}
      <div className="mb-12 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100/50 p-6 animate-slide-up">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
        <form onSubmit={handleProductSubmit} className="max-w-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              className="mt-1 border border-gray-200 rounded-xl p-2 w-full bg-gray-50/50 backdrop-blur-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              className="mt-1 border border-gray-200 rounded-xl p-2 w-full bg-gray-50/50 backdrop-blur-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              value={productForm.price}
              onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
              className="mt-1 border border-gray-200 rounded-xl p-2 w-full bg-gray-50/50 backdrop-blur-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={productForm.category}
              onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
              className="mt-1 border border-gray-200 rounded-xl p-2 w-full bg-gray-50/50 backdrop-blur-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select Category</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Stock</label>
            <input
              type="number"
              value={productForm.stock}
              onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
              className="mt-1 border border-gray-200 rounded-xl p-2 w-full bg-gray-50/50 backdrop-blur-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Image</label>
            {editingProduct && productForm.image === null && editingProduct.image && (
              <p className="text-sm text-gray-600 mb-1">Current Image: <a href={editingProduct.image} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">View</a></p>
            )}
            <input
              type="file"
              onChange={(e) => setProductForm({ ...productForm, image: e.target.files[0] })}
              className="mt-1 border border-gray-200 rounded-xl p-2 w-full bg-gray-50/50 backdrop-blur-sm"
              accept="image/*"
            />
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:scale-105 transform transition-all duration-300"
            >
              {editingProduct ? 'Update Product' : 'Add Product'}
            </button>
            {editingProduct && (
              <button
                type="button"
                onClick={handleCancelEditProduct}
                className="flex-1 bg-gray-500 text-white text-sm font-medium px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:scale-105 transform transition-all duration-300"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-4">Products</h3>
        <div className="grid gap-4">
          {products.length === 0 ? (
            <p className="text-gray-600 text-base font-medium">No products found.</p>
          ) : (
            products.map(p => (
              <div key={p._id} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100/50 p-4 flex justify-between items-center animate-slide-up">
                <div>
                  <p className="text-base font-semibold text-gray-900">{p.name}</p>
                  <p className="text-sm text-gray-600">${p.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Stock: {p.stock}</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleEditProduct(p)}
                    className="bg-yellow-500 text-white text-sm font-medium px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:scale-105 transform transition-all duration-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openModal('product', p._id, p.name, handleDeleteProduct)}
                    className="bg-red-500 text-white text-sm font-medium px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:scale-105 transform transition-all duration-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Category Management */}
      <div className="mb-12 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100/50 p-6 animate-slide-up">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
        <form onSubmit={handleCategorySubmit} className="max-w-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              className="mt-1 border border-gray-200 rounded-xl p-2 w-full bg-gray-50/50 backdrop-blur-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:scale-105 transform transition-all duration-300"
            >
              {editingCategory ? 'Update Category' : 'Add Category'}
            </button>
            {editingCategory && (
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="flex-1 bg-gray-500 text-white text-sm font-medium px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:scale-105 transform transition-all duration-300"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-4">Categories</h3>
        <div className="grid gap-4">
          {categories.length === 0 ? (
            <p className="text-gray-600 text-base font-medium">No categories found.</p>
          ) : (
            categories.map(c => (
              <div key={c._id} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100/50 p-4 flex justify-between items-center animate-slide-up">
                <p className="text-base font-semibold text-gray-900">{c.name}</p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setEditingCategory(c)}
                    className="bg-yellow-500 text-white text-sm font-medium px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:scale-105 transform transition-all duration-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openModal('category', c._id, c.name, handleDeleteCategory)}
                    className="bg-red-500 text-white text-sm font-medium px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:scale-105 transform transition-all duration-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Order Management */}
      <div className="mb-12 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100/50 p-6 animate-slide-up">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Orders</h2>
        {orders.length === 0 ? (
          <p className="text-gray-600 text-base font-medium">No orders found.</p>
        ) : (
          <div className="grid gap-4">
            {orders.map(o => (
              <div key={o._id} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100/50 p-4 flex justify-between items-center animate-slide-up">
                <div>
                  <p className="text-base font-semibold text-gray-900">Order ID: {o._id}</p>
                  <p className="text-sm text-gray-600">Total: ${o.totalPrice.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Status: {o.isPaid ? 'Paid' : 'Pending'} {o.isDelivered ? '(Delivered)' : ''}</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleUpdateOrder(o._id, !o.isDelivered)}
                    className={`text-white text-sm font-medium px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:scale-105 transform transition-all duration-300 ${o.isDelivered ? 'bg-green-500' : 'bg-yellow-500'}`}
                  >
                    {o.isDelivered ? 'Mark Undelivered' : 'Mark Delivered'}
                  </button>
                  <button
                    onClick={() => openModal('order', o._id, o._id, handleDeleteOrder)}
                    className="bg-red-500 text-white text-sm font-medium px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:scale-105 transform transition-all duration-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Management */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100/50 p-6 animate-slide-up">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Users</h2>
        {users.length === 0 ? (
          <p className="text-gray-600 text-base font-medium">No users found.</p>
        ) : (
          <div className="grid gap-4">
            {users.map(u => (
              <div
                key={u.id}
                className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100/50 p-4 flex justify-between items-center"
              >
                <div>
                  <p className="text-base font-semibold text-gray-900">{u.name}</p>
                  <p className="text-sm text-gray-600">{u.email}</p>
                  <p className="text-sm text-gray-600">Role: {u.role}</p>
                </div>
                <div className="flex space-x-3">
                  {user.role === 'superadmin' && (
                    <select
                      value={u.role}
                      onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                      className="bg-gray-50/50 backdrop-blur-sm border border-gray-200 rounded-xl p-2 text-sm font-medium text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                      disabled={u.id === user.id}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Superadmin</option>
                    </select>
                  )}
                  <button
                    onClick={() => openModal('user', u.id, u.name, handleDeleteUser)}
                    className="bg-red-500 text-white text-sm font-medium px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:scale-105 transform transition-all duration-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          .font-inter {
            font-family: 'Inter', sans-serif;
          }
          .animate-slide-up {
            animation: slideUp 0.5s ease-in-out;
          }
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default AdminDashboard;