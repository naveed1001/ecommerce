import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getProduct, addToWishlist, removeFromWishlist, addReview, getUserProfile } from '../services/api';
import { addToCart } from '../redux/slices/cartSlice';
import { getImageUrl } from '../utils/image';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await getProduct(id);
        setProduct(res.data);

        if (token) {
          const userRes = await getUserProfile();
          setIsInWishlist(userRes.data.wishlist.some(p => p._id === id));
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, token]);

  const handleAddToCart = () => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    if (product.stock === 0) {
      setError('Product out of stock');
      return;
    }
    dispatch(addToCart(product));
  };

  const handleWishlistToggle = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      if (isInWishlist) {
        await removeFromWishlist(id);
        setIsInWishlist(false);
      } else {
        await addToWishlist(id);
        setIsInWishlist(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update wishlist');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      await addReview(id, reviewForm);
      const res = await getProduct(id);
      setProduct(res.data);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-16 bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen font-inter">
        <div className="text-center py-12 bg-white/90 rounded-2xl shadow-xl border border-gray-100/50">
          <p className="text-gray-600 text-base font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-16 bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen font-inter">
        <div className="text-center py-12 bg-white/90 rounded-2xl shadow-xl border border-gray-100/50">
          <p className="text-red-500 text-base font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-6 py-16 bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen font-inter">
        <div className="text-center py-12 bg-white/90 rounded-2xl shadow-xl border border-gray-100/50">
          <p className="text-gray-600 text-base font-medium">Product not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-16 bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen font-inter">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="bg-white/90 rounded-2xl shadow-xl border border-gray-100/50 p-6">
            <img
              src={getImageUrl(product.image) || 'https://via.placeholder.com/300'}
              alt={product.name}
              className="w-full max-w-md h-auto object-cover rounded-xl border border-gray-200/50 mx-auto"
            />
          </div>
          <div className="bg-white/90 rounded-2xl shadow-xl border border-gray-100/50 p-6 flex flex-col justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">{product.name}</h1>
              <p className="text-gray-600 text-base mb-4">{product.description}</p>
              <p className="text-2xl font-semibold text-gray-900 mb-2">${product.price.toFixed(2)}</p>
              <p className="text-gray-500 text-sm mb-2">Category: {product.category?.name || 'N/A'}</p>
              <p className="text-gray-500 text-sm mb-4">Stock: {product.stock > 0 ? product.stock : 'Out of Stock'}</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 px-4 py-3 rounded-full text-white text-sm font-medium shadow-md hover:shadow-lg ${product.stock === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-green-700 hover:bg-gradient-to-r hover:from-green-600 hover:to-green-800'}`}
              >
                Add to Cart
              </button>
              <button
                onClick={handleWishlistToggle}
                className={`flex-1 px-4 py-3 rounded-full text-white text-sm font-medium shadow-md hover:shadow-lg ${isInWishlist ? 'bg-gradient-to-r from-red-500 to-red-700 hover:bg-gradient-to-r hover:from-red-600 hover:to-red-800' : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600'}`}
              >
                {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white/90 rounded-2xl shadow-xl border border-gray-100/50 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Reviews</h2>
          {product.reviews.length === 0 ? (
            <p className="text-gray-600 text-base font-medium">No reviews yet. Be the first to review!</p>
          ) : (
            <div className="grid gap-4">
              {product.reviews.map((review) => (
                <div key={review._id} className="bg-white/90 rounded-xl shadow-md border border-gray-100/50 p-4">
                  <p className="text-base font-medium text-gray-900">{review.user.name}</p>
                  <p className="text-yellow-500 text-sm">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
                  <p className="text-gray-600 text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          )}

          {token ? (
            <form onSubmit={handleReviewSubmit} className="mt-6 max-w-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Rating</label>
                <select
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                  className="mt-1 border border-gray-200 rounded-xl p-3 w-full bg-gray-50/70 focus:ring-indigo-500 focus:border-indigo-500 text-base"
                >
                  {[1, 2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Comment</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="mt-1 border border-gray-200 rounded-xl p-3 w-full bg-gray-50/70 focus:ring-indigo-500 focus:border-indigo-500 text-base"
                  rows="4"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium px-4 py-3 rounded-full shadow-md hover:shadow-lg hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600"
              >
                Submit Review
              </button>
            </form>
          ) : (
            <p className="mt-4 text-gray-600 text-base font-medium">
              Please <Link to="/login" className="text-indigo-500 font-semibold hover:text-indigo-600">login</Link> to write a review.
            </p>
          )}
        </div>
      </div>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          .font-inter {
            font-family: 'Inter', sans-serif;
          }
        `}
      </style>
    </div>
  );
};

export default ProductDetail;