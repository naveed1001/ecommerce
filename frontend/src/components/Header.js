import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../redux/slices/authSlice';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 shadow-lg sticky top-0 z-20 font-inter">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-semibold tracking-wide text-white hover:scale-105 hover:bg-white/10 rounded-full px-4 py-2 transition-all duration-300">
          E-commerce
        </Link>
        <nav className="flex space-x-6 items-center">
          <Link to="/" className="text-base font-semibold text-white hover:bg-white/10 rounded-full px-4 py-2 transition-all duration-300 hover:shadow-md hover:scale-105">
            Home
          </Link>
          <Link to="/cart" className="text-base font-semibold text-white hover:bg-white/10 rounded-full px-4 py-2 transition-all duration-300 hover:shadow-md hover:scale-105 relative">
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center shadow-md animate-glow">
                {cartCount}
              </span>
            )}
          </Link>
          <Link to="/wishlist" className="text-base font-semibold text-white hover:bg-white/10 rounded-full px-4 py-2 transition-all duration-300 hover:shadow-md hover:scale-105">
            Wishlist
          </Link>
          {token ? (
            <>
              <Link to="/dashboard" className="text-base font-semibold text-white hover:bg-white/10 rounded-full px-4 py-2 transition-all duration-300 hover:shadow-md hover:scale-105">
                Dashboard
              </Link>
              {['admin', 'superadmin'].includes(user?.role) && (
                <Link to="/admin" className="text-base font-semibold text-white hover:bg-white/10 rounded-full px-4 py-2 transition-all duration-300 hover:shadow-md hover:scale-105">
                  {user?.role}
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-base font-semibold text-white hover:bg-red-500/80 rounded-full px-4 py-2 transition-all duration-300 hover:shadow-md hover:scale-105"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-base font-semibold text-white hover:bg-white/10 rounded-full px-4 py-2 transition-all duration-300 hover:shadow-md hover:scale-105">
                Login
              </Link>
              <Link
                to="/register"
                className="text-base font-semibold bg-green-600 text-white rounded-full px-4 py-2 transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-green-700"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          .font-inter {
            font-family: 'Inter', sans-serif;
          }
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 5px rgba(255, 0, 0, 0.5); }
            50% { box-shadow: 0 0 15px rgba(255, 0, 0, 0.8); }
          }
          .animate-glow {
            animation: glow 1.5s ease-in-out infinite;
          }
        `}
      </style>
    </header>
  );
};

export default Header;