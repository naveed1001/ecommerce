import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { getUserProfile, removeFromWishlist } from '../services/api';
import { addToCart } from '../redux/slices/cartSlice';
import { getImageUrl } from '../utils/image';

const Wishlist = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication and fetch wishlist
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const res = await getUserProfile();
        setWishlist(res.data.wishlist || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load wishlist');
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [token, navigate]);

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
      <div className="container mx-auto px-6 py-12 bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen font-inter">
        <h1 className="text-3xl font-bold text-center tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse hover:shadow-glow transition-all duration-300">
          Your Wishlist
        </h1>
        <div className="text-center py-10 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100 mt-8">
          <p className="text-gray-600 text-base mb-6 font-medium">
            Please <Link to="/login" className="text-indigo-500 font-semibold hover:text-indigo-600 transition-colors duration-200">login</Link> to view your wishlist.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12 bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen font-inter">
        <h1 className="text-3xl font-bold text-center tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse hover:shadow-glow transition-all duration-300">
          Your Wishlist
        </h1>
        <div className="text-center py-10 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100 mt-8">
          <p className="text-gray-600 text-base font-medium animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-12 bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen font-inter">
        <h1 className="text-3xl font-bold text-center tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse hover:shadow-glow transition-all duration-300">
          Your Wishlist
        </h1>
        <div className="text-center py-10 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100 mt-8">
          <p className="text-red-500 text-base font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen font-inter">
      <h1 className="text-3xl font-bold text-center tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse hover:shadow-glow transition-all duration-300">
        Your Wishlist
      </h1>
      {wishlist.length === 0 ? (
        <div className="text-center py-10 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100 mt-8">
          <p className="text-gray-600 text-base mb-6 font-medium">
            Your wishlist is empty. <Link to="/" className="text-indigo-500 font-semibold hover:text-indigo-600 transition-colors duration-200">Browse products</Link>.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
          {wishlist.map((product) => (
            <div
              key={product._id}
              className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-5 border border-gray-100/50 hover:scale-[1.02]"
            >
              <img
                src={getImageUrl(product.image) || 'https://via.placeholder.com/150'}
                alt={product.name}
                className="w-full h-48 object-cover rounded-xl border border-gray-200/50 transition-transform duration-300 hover:scale-105"
              />
              <h3 className="text-base font-semibold text-gray-900 truncate mt-3 hover:text-indigo-500 transition-colors duration-200">{product.name}</h3>
              <p className="text-gray-800 text-sm font-medium">${product.price.toFixed(2)}</p>
              <div className="flex space-x-3 mt-3">
                <button
                  onClick={() => handleAddToCart(product)}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-700 text-white text-sm font-medium px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:scale-105 transform transition-all duration-300"
                >
                  Add to Cart
                </button>
                <button
                  onClick={() => handleRemoveFromWishlist(product._id)}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-700 text-white text-sm font-medium px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:scale-105 transform transition-all duration-300"
                >
                  Remove
                </button>
              </div>
              <Link
                to={`/product/${product._id}`}
                className="block mt-3 text-sm font-medium text-indigo-500 hover:text-indigo-600 transition-colors duration-200 text-center"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          .font-inter {
            font-family: 'Inter', sans-serif;
          }
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 5px rgba(79, 70, 229, 0.5); }
            50% { box-shadow: 0 0 15px rgba(79, 70, 229, 0.8); }
          }
          .shadow-glow {
            box-shadow: 0 0 10px rgba(79, 70, 229, 0.6);
          }
        `}
      </style>
    </div>
  );
};

export default Wishlist;