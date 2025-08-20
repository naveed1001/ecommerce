import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const { isLoading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Handle image selection and preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      alert('Please fill in all required fields');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }

    // In handleSubmit
    const resultAction = await dispatch(registerUser(formData));
    if (registerUser.fulfilled.match(resultAction)) {
      localStorage.setItem('pendingUserId', resultAction.payload.userId);
      navigate('/verify-otp');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 font-inter py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100/50 p-6 sm:p-8 animate-slide-up">
        <h1 className="text-3xl font-bold text-center tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-8">
          Create Your Account
        </h1>

        {error && (
          <div className="mb-6 bg-red-50/90 rounded-xl p-3 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="mt-1 border border-gray-200 rounded-xl p-3 w-full bg-gray-50/70 focus:ring-indigo-500 focus:border-indigo-500 text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="mt-1 border border-gray-200 rounded-xl p-3 w-full bg-gray-50/70 focus:ring-indigo-500 focus:border-indigo-500 text-base"
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
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Profile Image (Optional)</label>
            <div className="mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-200 border-dashed rounded-xl bg-gray-50/70 hover:border-indigo-500 transition-all duration-300">
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-32 h-32 rounded-full object-cover mx-auto mb-2 border border-gray-200" />
                ) : (
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="profileImage"
                    className="relative cursor-pointer bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full px-4 py-1 font-medium hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600"
                  >
                    <span>Upload a file</span>
                    <input
                      id="profileImage"
                      name="profileImage"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50"
          >
            {isLoading ? 'Registering...' : 'Create Account'}
          </button>
        </form>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
        .animate-slide-up {
          animation: slideUp 0.5s ease-in-out;
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Register;