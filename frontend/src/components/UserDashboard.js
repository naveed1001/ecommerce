import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getUserProfile, updateUserProfile, removeFromWishlist, getOrders } from '../services/api';
import { addToCart } from '../redux/slices/cartSlice';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateMessage, setUpdateMessage] = useState('');

  // Fetch user data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userRes = await getUserProfile();
        setProfile({ name: userRes.data.name, email: userRes.data.email });
        setWishlist(userRes.data.wishlist || []);

        const ordersRes = await getOrders();
        setOrders(ordersRes.data.filter(order => order.user._id === userRes.data._id)); // Only user's orders
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await updateUserProfile(profile);
      setProfile({ name: res.data.name, email: res.data.email });
      setUpdateMessage('Profile updated successfully');
      setTimeout(() => setUpdateMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  // Handle remove from wishlist
  const handleRemoveFromWishlist = async (productId) => {
    try {
      await removeFromWishlist(productId);
      setWishlist(wishlist.filter(item => item._id !== productId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove from wishlist');
    }
  };

  // Handle add to cart
  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
  };

  if (!token) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl mb-4">User Dashboard</h1>
        <p>Please <Link to="/login" className="text-blue-500">login</Link> to view your dashboard.</p>
      </div>
    );
  }

  if (loading) return <div className="container mx-auto p-4">Loading...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Dashboard</h1>

      {/* Profile Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Profile</h2>
        {updateMessage && <p className="text-green-500 mb-2">{updateMessage}</p>}
        <form onSubmit={handleProfileUpdate} className="max-w-md">
          <div className="mb-4">
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="border p-2 w-full rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="border p-2 w-full rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Password (leave blank to keep unchanged)</label>
            <input
              type="password"
              value={profile.password || ''}
              onChange={(e) => setProfile({ ...profile, password: e.target.value })}
              className="border p-2 w-full rounded"
              placeholder="New password"
            />
          </div>
          <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Update Profile
          </button>
        </form>
      </div>

      {/* Orders Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Order History</h2>
        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <div key={order._id} className="border p-4 rounded shadow">
                <p><strong>Order ID:</strong> {order._id}</p>
                <p><strong>Total:</strong> ${order.totalPrice.toFixed(2)}</p>
                <p><strong>Status:</strong> {order.isPaid ? 'Paid' : 'Pending'} {order.isDelivered ? '(Delivered)' : ''}</p>
                <p><strong>Items:</strong> {order.products.length}</p>
                <Link to={`/order/${order._id}`} className="text-blue-500">View Details</Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Wishlist Section */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Wishlist</h2>
        {wishlist.length === 0 ? (
          <p>Your wishlist is empty.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {wishlist.map((product) => (
              <div key={product._id} className="border p-4 rounded shadow">
                <img src={product.image} alt={product.name} className="w-full h-48 object-cover mb-2" />
                <h3 className="text-lg font-medium">{product.name}</h3>
                <p>${product.price.toFixed(2)}</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleRemoveFromWishlist(product._id)}
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
                <Link to={`/product/${product._id}`} className="text-blue-500 block mt-2">View Details</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;