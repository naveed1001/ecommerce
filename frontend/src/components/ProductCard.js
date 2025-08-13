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
    <div className="border p-4 rounded shadow">
      <img
        src={getImageUrl(product.image) || 'https://via.placeholder.com/300'}
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <h2 className="text-xl">{product.name}</h2>
      <p>${product.price}</p>
      <Link to={`/product/${product._id}`} className="text-blue-500">
        Details
      </Link>
      <button
        onClick={handleAddToCart}
        className="bg-green-500 text-white p-2 mt-2"
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;