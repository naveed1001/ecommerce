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
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          E-commerce
        </Link>
        <nav className="flex space-x-4 items-center">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <Link to="/cart" className="hover:underline">
            Cart ({cartCount})
          </Link>
          <Link to="/wishlist" className="hover:underline">
            Wishlist
          </Link>
          {token ? (
            <>
              <Link to="/dashboard" className="hover:underline">
                Dashboard
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="hover:underline">
                  Admin
                </Link>
              )}
              <button onClick={handleLogout} className="hover:underline">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">
                Login
              </Link>
              <Link to="/register" className="hover:underline">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;