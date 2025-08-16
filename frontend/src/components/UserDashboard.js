import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getUserProfile, updateUserProfile, removeFromWishlist, getOrders } from '../services/api';
import { addToCart } from '../redux/slices/cartSlice';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/image';

const UserDashboard = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState({ name: '', email: '', password: '', profileImage: '' });
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
      setProfile({ 
        name: userRes.data.name, 
        email: userRes.data.email, 
        password: '', 
        profileImage: userRes.data.profileImage || '' 
      });
      setWishlist(userRes.data.wishlist || []);

      const ordersRes = await getOrders();
      setOrders(ordersRes.data);
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
      const formData = new FormData();
      formData.append('name', profile.name);
      formData.append('email', profile.email);
      if (profile.password) formData.append('password', profile.password);
      if (profile.profileImage instanceof File) {
        formData.append('profileImage', profile.profileImage);
      }

      const res = await updateUserProfile(formData);
      setProfile({ 
        name: res.data.name, 
        email: res.data.email, 
        password: '', 
        profileImage: res.data.profileImage || '' 
      });
      setUpdateMessage('Profile updated successfully');
      setTimeout(() => setUpdateMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile({ ...profile, profileImage: file });
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
      <div className="container mx-auto px-6 py-16 bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen font-inter">
        <h1 className="text-4xl font-bold text-center tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-8">
          User Dashboard
        </h1>
        <div className="text-center py-12 bg-white/90 rounded-2xl shadow-xl border border-gray-100/50">
          <p className="text-gray-600 text-base font-medium">
            Please <Link to="/login" className="text-indigo-500 font-semibold hover:text-indigo-600">login</Link> to view your dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-16 bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen font-inter">
        <h1 className="text-4xl font-bold text-center tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-8">
          User Dashboard
        </h1>
        <div className="text-center py-12 bg-white/90 rounded-2xl shadow-xl border border-gray-100/50">
          <p className="text-gray-600 text-base font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-16 bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen font-inter">
        <h1 className="text-4xl font-bold text-center tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-8">
          User Dashboard
        </h1>
        <div className="text-center py-12 bg-white/90 rounded-2xl shadow-xl border border-gray-100/50">
          <p className="text-red-500 text-base font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-16 bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen font-inter">
      <h1 className="text-4xl font-bold text-center tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-10 animate-fade-in">
        User Dashboard
      </h1>

      {/* Profile Section */}
      <div className="mb-16 bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100/50 p-8 animate-slide-up">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Profile</h2>
        {updateMessage && (
          <p className="text-green-500 text-base font-medium mb-4 bg-green-50/50 rounded-xl p-3">{updateMessage}</p>
        )}
        <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-6">
          <div className="flex-shrink-0 mb-4 sm:mb-0">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gradient-to-r from-indigo-500 to-purple-500 shadow-lg hover:scale-105 transition-transform duration-300">
              <img
                src={profile.profileImage instanceof File ? URL.createObjectURL(profile.profileImage) : (getImageUrl(profile.profileImage) || 'https://via.placeholder.com/150')}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-2 text-center">
              <label
                htmlFor="profileImageUpdate"
                className="cursor-pointer bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-medium px-3 py-1 rounded-full hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600"
              >
                Change Photo
                <input
                  id="profileImageUpdate"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>
          <form onSubmit={handleProfileUpdate} className="flex-1 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="mt-1 border border-gray-200 rounded-xl p-3 w-full bg-gray-50/70 focus:ring-indigo-500 focus:border-indigo-500 text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="mt-1 border border-gray-200 rounded-xl p-3 w-full bg-gray-50/70 focus:ring-indigo-500 focus:border-indigo-500 text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password (leave blank to keep unchanged)</label>
              <input
                type="password"
                value={profile.password}
                onChange={(e) => setProfile({ ...profile, password: e.target.value })}
                className="mt-1 border border-gray-200 rounded-xl p-3 w-full bg-gray-50/70 focus:ring-indigo-500 focus:border-indigo-500 text-base"
                placeholder="New password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600"
            >
              Update Profile
            </button>
          </form>
        </div>
      </div>

      {/* Orders Section */}
      <div className="mb-16 bg-white/90 rounded-2xl shadow-xl border border-gray-100/50 p-8 animate-slide-up">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Order History</h2>
        {orders.length === 0 ? (
          <p className="text-gray-600 text-base font-medium">No orders found.</p>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white/90 rounded-2xl shadow-lg border border-gray-100/50 p-4 flex justify-between items-center">
                <div>
                  <p className="text-base font-semibold text-gray-900">Order ID: {order._id}</p>
                  <p className="text-sm text-gray-600">Total: ${order.totalPrice.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Status: {order.isPaid ? 'Paid' : 'Pending'} {order.isDelivered ? '(Delivered)' : ''}</p>
                  <p className="text-sm text-gray-600">Items: {order.products.length}</p>
                </div>
                <Link
                  to={`/order/${order._id}`}
                  className="text-indigo-500 text-sm font-medium hover:text-indigo-600"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Wishlist Section */}
      <div className="bg-white/90 rounded-2xl shadow-xl border border-gray-100/50 p-8 animate-slide-up">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Wishlist</h2>
        {wishlist.length === 0 ? (
          <p className="text-gray-600 text-base font-medium">
            Your wishlist is empty. <Link to="/" className="text-indigo-500 font-semibold hover:text-indigo-600">Browse products</Link>.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {wishlist.map((product) => (
              <div key={product._id} className="bg-white/90 rounded-2xl shadow-lg border border-gray-100/50 p-5">
                <img
                  src={getImageUrl(product.image) || 'https://via.placeholder.com/150'}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-xl border border-gray-200/50"
                />
                <h3 className="text-base font-semibold text-gray-900 truncate mt-3">{product.name}</h3>
                <p className="text-gray-800 text-sm font-medium">${product.price.toFixed(2)}</p>
                <div className="flex space-x-3 mt-3">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-700 text-white text-sm font-medium px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:bg-gradient-to-r hover:from-green-600 hover:to-green-800"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleRemoveFromWishlist(product._id)}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-700 text-white text-sm font-medium px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:bg-gradient-to-r hover:from-red-600 hover:to-red-800"
                  >
                    Remove
                  </button>
                </div>
                <Link
                  to={`/product/${product._id}`}
                  className="block mt-3 text-sm font-medium text-indigo-500 hover:text-indigo-600 text-center"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        .animate-slide-up {
          animation: slideUp 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default UserDashboard;