import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import { getImageUrl } from '../utils/image';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);

  const handleAddToCart = () => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    if (product.stock === 0) {
      alert('Product is out of stock');
      return;
    }
    dispatch(addToCart(product));
  };

  return (
    <div className="bg-white/90 rounded-2xl shadow-xl border border-gray-100/50 p-5 font-inter">
      <img
        src={getImageUrl(product.image) || 'https://via.placeholder.com/300'}
        alt={product.name}
        className="w-full h-48 object-cover rounded-xl border border-gray-200/50 mb-3"
      />
      <h2 className="text-lg font-semibold text-gray-900 truncate">{product.name}</h2>
      <p className="text-base font-medium text-gray-800">${product.price.toFixed(2)}</p>
      <div className="flex justify-between items-center mt-3">
        <Link
          to={`/product/${product._id}`}
          className="text-indigo-500 text-sm font-medium hover:text-indigo-600"
        >
          Details
        </Link>
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`px-4 py-2 rounded-full text-white text-sm font-medium shadow-md hover:shadow-lg ${product.stock === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-green-700 hover:bg-gradient-to-r hover:from-green-600 hover:to-green-800'}`}
        >
          Add to Cart
        </button>
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

export default ProductCard;