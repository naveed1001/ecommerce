import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { createOrder } from '../services/api';

const REQUIRED_FIELDS = ['street', 'city', 'postalCode', 'country'];

const InputField = ({ label, name, value, onChange, required, type = 'text', isTextarea = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 tracking-wide">{label}</label>
    {isTextarea ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        className="mt-1 w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 shadow-sm transition-all duration-300 ease-in-out hover:shadow-md"
        rows="4"
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="mt-1 w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 shadow-sm transition-all duration-300 ease-in-out hover:shadow-md"
      />
    )}
  </div>
);

const OrderItem = ({ item, index }) => (
  <li className="flex justify-between items-center py-2 text-gray-700 transition-all duration-200 hover:bg-gray-50 rounded-lg px-2">
    <span className="text-sm font-medium truncate max-w-[60%]">{item.name} × {item.quantity}</span>
    <span className="text-sm font-semibold">${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</span>
  </li>
);

const Checkout = () => {
  const { items } = useSelector((state) => state.cart);
  const [state, setState] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    postalCode: '',
    country: '',
    notes: '',
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [missingFields, setMissingFields] = useState([]);
  const dialogRef = useRef(null);

  // Calculate total price directly from cart items
  const total = items.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 0), 0);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  }, []);

  const closeDialog = useCallback(() => {
    setDialogOpen(false);
    if (dialogRef.current) {
      dialogRef.current.close();
    }
  }, []);

  // useEffect now only handles URL parameters related to payment results
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('error') === 'payment_failed') {
      setState('error');
      setErrorMessage('Payment was not successful. Please try again.');
    } else if (urlParams.get('error') === 'invalid_session') {
      setState('error');
      setErrorMessage('Invalid payment session. Please try again.');
    }
  }, []);

  const handleCheckout = useCallback(async () => {
    const missing = REQUIRED_FIELDS.filter(field => !shippingAddress[field].trim());
    
    if (missing.length > 0) {
      setMissingFields(missing);
      setDialogOpen(true);
      if (dialogRef.current) {
        dialogRef.current.showModal();
      }
      return;
    }

    setState('processing');
    setErrorMessage('');
    try {
      const { data } = await createOrder({
        products: items.map(item => ({
          productId: item._id || item.product?._id,
          quantity: item.quantity,
        })),
        shippingAddress,
        paymentMethod: 'stripe',
      });
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setState('error');
      setErrorMessage(err.message || 'Failed to initiate checkout. Please try again.');
    }
  }, [items, shippingAddress]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-inter">
      <div className="container mx-auto p-8 max-w-2xl bg-white rounded-3xl shadow-2xl backdrop-blur-sm border border-gray-100/30 animate-fade-in">
        <h2 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-8 tracking-tight">
          Complete Your Checkout
        </h2>

        {/* Shipping Address Form */}
        <section className="mb-10">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Shipping Address
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="Street Address" name="street" value={shippingAddress.street} onChange={handleInputChange} required />
            <InputField label="City" name="city" value={shippingAddress.city} onChange={handleInputChange} required />
            <InputField label="Postal Code" name="postalCode" value={shippingAddress.postalCode} onChange={handleInputChange} required />
            <InputField label="Country" name="country" value={shippingAddress.country} onChange={handleInputChange} required />
            <InputField
              label="Additional Notes (Optional)"
              name="notes"
              value={shippingAddress.notes}
              onChange={handleInputChange}
              isTextarea
            />
          </div>
        </section>

        {/* Order Summary */}
        <section className="mb-10">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Order Summary
          </h3>
          <ul className="space-y-1">
            {items.map((item, index) => (
              <OrderItem key={index} item={item} index={index} />
            ))}
          </ul>
          <div className="flex justify-between font-bold mt-4 text-gray-900 text-lg">
            <span>Total</span>
            <span className="text-indigo-600">${total.toFixed(2)}</span>
          </div>
        </section>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={state === 'processing' || !items.length}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        >
          {state === 'processing' ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Processing...
            </span>
          ) : (
            'Proceed to Payment'
          )}
        </button>

        {/* Dialog for Missing Fields */}
        <dialog
          ref={dialogRef}
          className="p-6 bg-white rounded-2xl shadow-2xl border border-gray-100/30 backdrop-blur-md max-w-md w-full animate-dialog-pop"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Missing Required Fields</h3>
            <button
              onClick={closeDialog}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600 mb-4">
            Please fill in the following required fields:
            <ul className="list-disc list-inside mt-2 text-sm">
              {missingFields.map((field) => (
                <li key={field} className="text-red-600 capitalize">
                  {field}
                </li>
              ))}
            </ul>
          </p>
          <button
            onClick={closeDialog}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-2 rounded-xl font-semibold shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-300"
          >
            OK
          </button>
        </dialog>
        
        <style jsx>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          .font-inter {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .animate-fade-in {
            animation: fadeIn 0.5s ease-in-out;
          }
          .animate-slide-up {
            animation: slideUp 0.4s ease-in-out;
          }
          .animate-dialog-pop {
            animation: dialogPop 0.3s ease-out;
          }
          dialog::backdrop {
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes dialogPop {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Checkout;