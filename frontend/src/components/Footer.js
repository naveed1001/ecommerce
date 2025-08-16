import { Link } from 'react-router-dom';
import { FaInfoCircle, FaLink, FaHome, FaShoppingCart, FaHeart, FaUserCircle, FaEnvelope, FaAt, FaPhone, FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-white py-16">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* About Section */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center">
              <FaInfoCircle className="w-5 h-5 mr-2 text-indigo-300" />
              About Us
            </h3>
            <p className="text-gray-200 leading-relaxed text-sm">
              Discover a world of premium products crafted with quality and style in mind. ShopApp delivers unparalleled convenience and elegance to your shopping experience.
            </p>
          </div>
          {/* Navigation Links */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center">
              <FaLink className="w-5 h-5 mr-2 text-indigo-300" />
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="flex items-center text-gray-200 hover:text-indigo-300 text-sm font-medium transition-all duration-300 ease-in-out transform hover:translate-x-1"
                >
                  <FaHome className="w-4 h-4 mr-2 text-indigo-300" />
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="flex items-center text-gray-200 hover:text-indigo-300 text-sm font-medium transition-all duration-300 ease-in-out transform hover:translate-x-1"
                >
                  <FaShoppingCart className="w-4 h-4 mr-2 text-indigo-300" />
                  Cart
                </Link>
              </li>
              <li>
                <Link
                  to="/wishlist"
                  className="flex items-center text-gray-200 hover:text-indigo-300 text-sm font-medium transition-all duration-300 ease-in-out transform hover:translate-x-1"
                >
                  <FaHeart className="w-4 h-4 mr-2 text-indigo-300" />
                  Wishlist
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="flex items-center text-gray-200 hover:text-indigo-300 text-sm font-medium transition-all duration-300 ease-in-out transform hover:translate-x-1"
                >
                  <FaUserCircle className="w-4 h-4 mr-2 text-indigo-300" />
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center">
              <FaEnvelope className="w-5 h-5 mr-2 text-indigo-300" />
              Contact Us
            </h3>
            <div className="space-y-3 text-gray-200 text-sm">
              <p className="flex items-center">
                <FaAt className="w-4 h-4 mr-2 text-indigo-300" />
                Email: <a href="mailto:support@shopapp.com" className="hover:text-indigo-300 transition-colors ml-1">support@shopapp.com</a>
              </p>
              <p className="flex items-center">
                <FaPhone className="w-4 h-4 mr-2 text-indigo-300" />
                Phone: <a href="tel:+1234567890" className="hover:text-indigo-300 transition-colors ml-1">(123) 456-7890</a>
              </p>
            </div>
            <div className="flex space-x-6 mt-6">
              <a
                href="#"
                className="text-gray-200 hover:text-indigo-300 transition-all duration-300 ease-in-out transform hover:scale-110"
                aria-label="Facebook"
              >
                <FaFacebookF className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-200 hover:text-indigo-300 transition-all duration-300 ease-in-out transform hover:scale-110"
                aria-label="Twitter"
              >
                <FaTwitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-200 hover:text-indigo-300 transition-all duration-300 ease-in-out transform hover:scale-110"
                aria-label="Instagram"
              >
                <FaInstagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-700/50 text-center">
          <p className="text-gray-300 text-sm">
            &copy; {new Date().getFullYear()} ShopApp. All rights reserved.
          </p>
        </div>
      </div>
      <style jsx>{`
        footer {
          position: relative;
          overflow: hidden;
        }
        footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(to right, #4f46e5, #c084fc);
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
        .grid > div {
          animation: fadeInUp 0.6s ease-out forwards;
          animation-delay: calc(0.1s * var(--i));
        }
        svg {
          transition: transform 0.3s ease-in-out, color 0.3s ease-in-out;
        }
        a:hover svg {
          transform: scale(1.2);
        }
      `}</style>
    </footer>
  );
};

export default Footer;