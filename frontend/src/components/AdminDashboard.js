import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  getProducts, createProduct, updateProduct, deleteProduct,
  getCategories, createCategory, updateCategory, deleteCategory,
  getOrders, updateOrder, deleteOrder,
  getAllUsers, deleteUser // Assuming deleteUser is added in userController
} from '../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', category: '', stock: 0, image: null });
  const [categoryForm, setCategoryForm] = useState({ name: '' });
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  // Check admin role
  useEffect(() => {
    if (!token || user?.role !== 'admin') {
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
        setProducts(productRes.data);
        setCategories(categoryRes.data);
        setOrders(orderRes.data);
        setUsers(userRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load data');
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
      if (key === 'image' && productForm[key]) formData.append(key, productForm[key]);
      else if (productForm[key]) formData.append(key, productForm[key]);
    });

    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, formData);
        setProducts(products.map(p => p._id === editingProduct._id ? { ...p, ...productForm } : p));
        setEditingProduct(null);
      } else {
        const res = await createProduct(formData);
        setProducts([...products, res.data]);
      }
      setProductForm({ name: '', description: '', price: '', category: '', stock: 0, image: null });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    }
  };

  // Handle category form submission
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory(editingCategory._id, categoryForm);
        setCategories(categories.map(c => c._id === editingCategory._id ? { ...c, ...categoryForm } : c));
        setEditingCategory(null);
      } else {
        const res = await createCategory(categoryForm);
        setCategories([...categories, res.data]);
      }
      setCategoryForm({ name: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category');
    }
  };

  // Handle product deletion
  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id);
      setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  };

  // Handle category deletion
  const handleDeleteCategory = async (id) => {
    try {
      await deleteCategory(id);
      setCategories(categories.filter(c => c._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete category');
    }
  };

  // Handle order status update
  const handleUpdateOrder = async (id, isDelivered) => {
    try {
      await updateOrder(id, { isDelivered });
      setOrders(orders.map(o => o._id === id ? { ...o, isDelivered, deliveredAt: isDelivered ? new Date() : o.deliveredAt } : o));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order');
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (id) => {
    try {
      await deleteUser(id); // Assuming deleteUser exists
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  if (loading) return <div className="container mx-auto p-4">Loading...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {/* Product Management */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
        <form onSubmit={handleProductSubmit} className="max-w-md">
          <div className="mb-4">
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              className="border p-2 w-full rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              className="border p-2 w-full rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Price</label>
            <input
              type="number"
              value={productForm.price}
              onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
              className="border p-2 w-full rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Category</label>
            <select
              value={productForm.category}
              onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
              className="border p-2 w-full rounded"
            >
              <option value="">Select Category</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Stock</label>
            <input
              type="number"
              value={productForm.stock}
              onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
              className="border p-2 w-full rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Image</label>
            <input
              type="file"
              onChange={(e) => setProductForm({ ...productForm, image: e.target.files[0] })}
              className="border p-2 w-full rounded"
            />
          </div>
          <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            {editingProduct ? 'Update Product' : 'Add Product'}
          </button>
          {editingProduct && (
            <button
              type="button"
              onClick={() => setEditingProduct(null)}
              className="ml-2 bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </form>

        <h3 className="text-lg font-semibold mt-4 mb-2">Products</h3>
        <div className="grid gap-4">
          {products.map(p => (
            <div key={p._id} className="border p-4 rounded shadow flex justify-between">
              <div>
                <p><strong>{p.name}</strong></p>
                <p>${p.price}</p>
                <p>Stock: {p.stock}</p>
              </div>
              <div>
                <button
                  onClick={() => setEditingProduct(p)}
                  className="bg-yellow-500 text-white p-2 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteProduct(p._id)}
                  className="bg-red-500 text-white p-2 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Management */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
        <form onSubmit={handleCategorySubmit} className="max-w-md">
          <div className="mb-4">
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              className="border p-2 w-full rounded"
            />
          </div>
          <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            {editingCategory ? 'Update Category' : 'Add Category'}
          </button>
          {editingCategory && (
            <button
              type="button"
              onClick={() => setEditingCategory(null)}
              className="ml-2 bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </form>

        <h3 className="text-lg font-semibold mt-4 mb-2">Categories</h3>
        <div className="grid gap-4">
          {categories.map(c => (
            <div key={c._id} className="border p-4 rounded shadow flex justify-between">
              <p>{c.name}</p>
              <div>
                <button
                  onClick={() => setEditingCategory(c)}
                  className="bg-yellow-500 text-white p-2 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCategory(c._id)}
                  className="bg-red-500 text-white p-2 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Management */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Orders</h2>
        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <div className="grid gap-4">
            {orders.map(o => (
              <div key={o._id} className="border p-4 rounded shadow flex justify-between">
                <div>
                  <p><strong>Order ID:</strong> {o._id}</p>
                  <p><strong>Total:</strong> ${o.totalPrice.toFixed(2)}</p>
                  <p><strong>Status:</strong> {o.isPaid ? 'Paid' : 'Pending'} {o.isDelivered ? '(Delivered)' : ''}</p>
                </div>
                <div>
                  <button
                    onClick={() => handleUpdateOrder(o._id, !o.isDelivered)}
                    className="bg-yellow-500 text-white p-2 rounded mr-2"
                  >
                    {o.isDelivered ? 'Mark Undelivered' : 'Mark Delivered'}
                  </button>
                  <button
                    onClick={() => handleDeleteOrder(o._id)}
                    className="bg-red-500 text-white p-2 rounded"
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
      <div>
        <h2 className="text-xl font-semibold mb-2">Users</h2>
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <div className="grid gap-4">
            {users.map(u => (
              <div key={u._id} className="border p-4 rounded shadow flex justify-between">
                <div>
                  <p><strong>{u.name}</strong></p>
                  <p>{u.email}</p>
                  <p>Role: {u.role}</p>
                </div>
                <button
                  onClick={() => handleDeleteUser(u._id)}
                  className="bg-red-500 text-white p-2 rounded"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;