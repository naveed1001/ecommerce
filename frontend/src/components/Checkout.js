import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { createOrder } from '../services/api';

const Checkout = () => {
  const { items } = useSelector((state) => state.cart);
  const [state, setState] = useState('idle'); // idle, processing, error
  const [errorMessage, setErrorMessage] = useState('');
  const [total, setTotal] = useState(0);

  // Check for error query param and fetch total
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('error') === 'payment_failed') {
      setState('error');
      setErrorMessage('Payment was not successful. Please try again.');
    } else if (urlParams.get('error') === 'invalid_session') {
      setState('error');
      setErrorMessage('Invalid payment session. Please try again.');
    }

    // Fetch total for display (server-validated)
    const fetchTotal = async () => {
      try {
        const { data } = await createOrder({
          products: items.map(item => ({
            productId: item._id || item.product?._id,
            quantity: item.quantity,
          })),
          shippingAddress: 'Pending',
          paymentMethod: 'stripe',
        });
        console.log('createOrder response:', data); // Log for debugging
        setTotal(data.totalPrice);
      } catch (err) {
        setState('error');
        setErrorMessage(err.message || 'Failed to load order details. Please try again.');
      }
    };
    if (items.length) fetchTotal();
  }, [items]);

  const handleCheckout = async () => {
    setState('processing');
    setErrorMessage('');
    try {
      const { data } = await createOrder({
        products: items.map(item => ({
          productId: item._id || item.product?._id,
          quantity: item.quantity,
        })),
        shippingAddress: 'Pending',
        paymentMethod: 'stripe',
      });
      console.log('Checkout orderId:', data.orderId, 'Redirecting to:', data.checkoutUrl); // Log for debugging
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setState('error');
      setErrorMessage(err.message || 'Failed to initiate checkout. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto p-10 max-w-2xl bg-white rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Checkout</h2>

        {/* Order Summary */}
        <div className="mb-10">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li key={index} className="flex justify-between text-gray-700">
                <span>{item.name} × {item.quantity}</span>
                <span>${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between font-bold mt-4 text-gray-900">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={state === 'processing' || !items.length}
          className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4 rounded-lg font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {state === 'processing' ? 'Processing...' : 'Proceed to Payment'}
        </button>

        {/* Error Message */}
        {state === 'error' && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg text-center">
            {errorMessage}
            <button
              onClick={() => setState('idle')}
              className="mt-2 text-red-600 underline"
            >
              Try Again
            </button>
          </div>
        )}

        <style jsx>{`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-in-out;
          }
        `}</style>
      </div>
    </div>
  );
};

export default Checkout;