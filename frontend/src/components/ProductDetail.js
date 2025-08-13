import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // ✅ Added Link here
import { useSelector, useDispatch } from 'react-redux';
import { getProduct, addToWishlist, removeFromWishlist, addReview, getUserProfile } from '../services/api'; // ✅ Added getUserProfile
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

  if (loading) return <div className="container mx-auto p-4">Loading...</div>;
  if (error) return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  if (!product) return <div className="container mx-auto p-4">Product not found</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <img
            src={getImageUrl(product.image) || 'https://via.placeholder.com/300'}
            alt={product.name}
            className="w-full max-w-md h-auto object-cover rounded"
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <p className="text-xl font-semibold mb-2">${product.price.toFixed(2)}</p>
          <p className="text-gray-500 mb-2">Category: {product.category?.name || 'N/A'}</p>
          <p className="text-gray-500 mb-4">Stock: {product.stock > 0 ? product.stock : 'Out of Stock'}</p>

          <div className="flex space-x-4 mb-4">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`px-4 py-2 rounded text-white ${product.stock === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
            >
              Add to Cart
            </button>
            <button
              onClick={handleWishlistToggle}
              className={`px-4 py-2 rounded text-white ${isInWishlist ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
            >
              {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
        {product.reviews.length === 0 ? (
          <p>No reviews yet. Be the first to review!</p>
        ) : (
          <div className="grid gap-4">
            {product.reviews.map((review) => (
              <div key={review._id} className="border p-4 rounded shadow">
                <p className="font-medium">{review.user.name}</p>
                <p className="text-yellow-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
                <p className="text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        )}

        {token ? (
          <form onSubmit={handleReviewSubmit} className="mt-6 max-w-md">
            <h3 className="text-lg font-semibold mb-2">Write a Review</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium">Rating</label>
              <select
                value={reviewForm.rating}
                onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                className="border p-2 w-full rounded"
              >
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Comment</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                className="border p-2 w-full rounded"
                rows="4"
              />
            </div>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Submit Review
            </button>
          </form>
        ) : (
          <p className="mt-4">
            Please <Link to="/login" className="text-blue-500">login</Link> to write a review.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;