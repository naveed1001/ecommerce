import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  // Local state for form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Redux state
  const { isLoading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      alert('Please fill in all fields');
      return;
    }

    const resultAction = await dispatch(registerUser({ name, email, password }));

    if (registerUser.fulfilled.match(resultAction)) {
      navigate('/');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="container mx-auto p-4 max-w-md">
      {error && (
        <div className="mb-4 text-red-800 bg-red-100 p-2 rounded">
          {error}
        </div>
      )}

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className="border p-2 w-full mb-2 rounded"
      />

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="border p-2 w-full mb-2 rounded"
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="border p-2 w-full mb-4 rounded"
      />

      <button
        type="submit"
        disabled={isLoading}
        className="bg-blue-500 text-white p-2 w-full rounded disabled:opacity-50"
      >
        {isLoading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
};

export default Register;