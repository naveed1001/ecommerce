import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, error } = useSelector((state) => state.auth);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }))
      .unwrap()
      .then(() => {
        navigate('/'); // redirect on successful login
      })
      .catch(() => {
        // Error is already handled in Redux, so nothing extra here
      });
  };

  return (
    <div className="container mx-auto px-6 py-16 bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen font-inter">
      <h2 className="text-4xl font-bold text-center tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-10">
        Login
      </h2>
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white/90 rounded-2xl shadow-xl border border-gray-100/50 p-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="mt-1 border border-gray-200 rounded-xl p-3 w-full bg-gray-50/70 focus:ring-indigo-500 focus:border-indigo-500 text-base"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="mt-1 border border-gray-200 rounded-xl p-3 w-full bg-gray-50/70 focus:ring-indigo-500 focus:border-indigo-500 text-base"
            required
          />
        </div>
        {error && (
          <p className="text-red-500 text-sm font-medium bg-red-50/50 rounded-xl p-3 text-center">{error}</p>
        )}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium px-4 py-3 rounded-full shadow-md hover:shadow-lg hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
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

export default Login;