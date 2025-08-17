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
    <div className="bg-gradient-to-b from-gray-50 to-gray-200 min-h-screen font-inter">
      {/* Hero Section */}
      <Hero />

      {/* Products Section */}
      <section id="products" className="container mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-12 text-center tracking-tight animate-fade-in-up">
          Explore Our Premium Collection
        </h2>
        {loading && (
          <div className="text-center animate-fade-in-up">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-indigo-600 border-gray-300"></div>
            <p className="mt-4 text-gray-600 text-lg font-medium">Loading our exclusive products...</p>
          </div>
        )}
        {error && (
          <div className="text-center bg-red-100/80 text-red-600 p-4 rounded-lg mx-auto max-w-md animate-fade-in-up">
            {error}
          </div>
        )}
        {products.length === 0 && !loading && !error ? (
          <p className="text-center text-gray-500 text-lg font-medium animate-fade-in-up">
            No products available. Discover new arrivals soon!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <div
                key={product._id}
                className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={getImageUrl(product.image) || 'https://via.placeholder.com/150'}
                    alt={product.name}
                    className="w-full h-64 object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-base font-semibold text-gray-900 truncate hover:text-indigo-600 transition-colors duration-300">
                    {product.name}
                  </h3>
                  <p className="text-base font-bold text-gray-800 mt-2">
                    ${product.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1 font-medium">
                    {product.stock > 0 ? (
                      `In Stock: ${product.stock}`
                    ) : (
                      <span className="text-red-500">Out of Stock</span>
                    )}
                  </p>
                  <div className="mt-4 flex space-x-3">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className={`flex-1 py-1 px-2 rounded-full text-white font-semibold text-base transition-all duration-300 transform hover:scale-105 ${
                        product.stock === 0
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      Add to Cart
                    </button>
                    <Link
                      to={`/product/${product._id}`}
                      className="flex-1 py-1 px-2 rounded-full bg-indigo-600 text-white font-semibold text-base text-center hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
                {product.stock > 0 && (
                  <span className="absolute top-4 right-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-semibold px-2 py-1 rounded-full animate-glow">
                    Available
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer Section */}
      <Footer />

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(79, 70, 229, 0.5); }
          50% { box-shadow: 0 0 15px rgba(79, 70, 229, 0.8); }
        }
        .animate-glow {
          animation: glow 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Home;