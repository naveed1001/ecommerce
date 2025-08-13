import { Routes, Route } from 'react-router-dom';
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
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { loadUserProfile } from './redux/slices/authSlice';


function App() {

  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(loadUserProfile());
    }
  }, [token, dispatch]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/wishlist" element={<Wishlist />} />
      </Routes>
    </div>
  );
}

export default App;