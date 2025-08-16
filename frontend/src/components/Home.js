import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { getProducts } from '../services/api';
import { addToCart } from '../redux/slices/cartSlice';
import { getImageUrl } from '../utils/image';
import Hero from './Hero';
import Footer from './Footer';

const Home = () => {
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await getProducts();
        if (Array.isArray(res.data.products)) {
          setProducts(res.data.products);
        } else {
          setProducts([]);
          setError('Invalid product data received');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    if (product.stock === 0) {
      setError('Product out of stock');
      return;
    }
    dispatch(addToCart(product));
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Products Section */}
      <section id="products" className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Our Products</h2>
        {loading && <div className="text-center text-gray-600">Loading...</div>}
        {error && <div className="text-center text-red-500">{error}</div>}
        {products.length === 0 && !loading && !error ? (
          <p className="text-center text-gray-600">No products available. Check back later!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                <img
                  src={getImageUrl(product.image) || 'https://via.placeholder.com/150'}
                  alt={product.name}
                  className="w-full h-60 object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
                  <p className="text-gray-600 font-medium mt-1">${product.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {product.stock > 0 ? `In Stock: ${product.stock}` : 'Out of Stock'}
                  </p>
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className={`flex-1 py-2 rounded-full text-white font-medium transition-colors duration-300 ${
                        product.stock === 0
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      Add to Cart
                    </button>
                    <Link
                      to={`/product/${product._id}`}
                      className="flex-1 py-2 rounded-full bg-indigo-600 text-white font-medium text-center hover:bg-indigo-700 transition-colors duration-300"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
            {/* Footer Section */}
      <Footer />
    </div>
  );
};

export default Home;