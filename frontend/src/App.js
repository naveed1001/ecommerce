import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadUserProfile } from './redux/slices/authSlice';
import Header from './components/Header';
import Home from './components/Home';
import ProductDetail from './components/ProductDetail';
import Login from './components/Login';
import Register from './components/Register';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import Wishlist from './components/Wishlist';
import OrderDetails from './components/OrderDetails';
import OTPVerification from './components/OTPVerification';

function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(loadUserProfile());
    }
  }, [token, dispatch]);

  // Handle /order/success redirect
  useEffect(() => {
    if (location.pathname.startsWith('/order/success')) {
      const sessionId = new URLSearchParams(location.search).get('session_id');
      if (!sessionId) {
        navigate('/checkout?error=invalid_session');
      } else {
        console.log('Received success redirect with session_id:', sessionId);
        // Server will redirect to /order/:id, so we rely on that
      }
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<OTPVerification />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/order/:id" element={<OrderDetails />} />
        <Route path="/order/success" element={<OrderDetails />} />
      </Routes>
    </div>
  );
}

export default App;