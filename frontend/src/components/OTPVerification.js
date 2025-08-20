import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { verifyOTP, resendOTP } from '../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const { isLoading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userId = localStorage.getItem('pendingUserId');

  useEffect(() => {
    if (!userId) {
      navigate('/register');
    }
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [navigate, userId]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (/^[0-9]$/.test(value) || value === '') {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 3) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  const otpCode = otp.join('');
  if (otpCode.length !== 4) {
    return;
  }

  const payload = { userId, otp: otpCode };
  const resultAction = await dispatch(verifyOTP(payload));
  if (verifyOTP.fulfilled.match(resultAction)) {
    localStorage.removeItem('pendingUserId');
    navigate('/');
  } else {
    console.error('❌ OTP verification failed:', resultAction.payload); // Log failure
  }
};

  const handleResend = async () => {
    if (!canResend) return;
    const resultAction = await dispatch(resendOTP({ userId }));
    if (resendOTP.fulfilled.match(resultAction)) {
      setTimer(60);
      setCanResend(false);
    } else {
      console.log('Resend OTP failed:', resultAction.payload); // Log resend failure
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 font-inter py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-indigo-100/50 p-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-center tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-6">
          Verify Your Email
        </h1>
        <p className="text-center text-gray-600 mb-8">Enter the 4-digit OTP sent to your email</p>

        {error && (
          <div className="mb-6 bg-red-50/90 rounded-xl p-3 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-center space-x-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                className="w-16 h-16 text-center text-3xl font-bold border-2 border-indigo-200 rounded-2xl bg-indigo-50/50 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none shadow-md transition-all duration-300"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.join('').length !== 4}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 rounded-full shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-300"
          >
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={handleResend}
            disabled={!canResend || isLoading}
            className="text-indigo-600 font-medium hover:text-indigo-800 disabled:text-gray-400"
          >
            {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
          </button>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default OTPVerification;