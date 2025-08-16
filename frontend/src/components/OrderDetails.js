import { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getOrderById } from '../services/api';

const MAX_RETRIES = 2;

const InfoCard = ({ title, value, className }) => (
  <div className={className}>
    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
    <p className="text-lg font-semibold">{value}</p>
  </div>
);

const OrderItem = ({ product, quantity }) => (
  <div className="flex justify-between items-center bg-gray-50/50 rounded-xl p-4 hover:bg-gray-100/80 transition-all duration-300">
    <div>
      <p className="text-base font-medium text-gray-900">{product?.name || 'Unknown Product'}</p>
      <p className="text-sm text-gray-600">Quantity: {quantity || 0}</p>
    </div>
    <p className="text-base font-semibold text-gray-900">
      ${product?.price ? (product.price * quantity).toFixed(2) : 'N/A'}
    </p>
  </div>
);

const formatPKTDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-PK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      timeZone: 'Asia/Karachi',
    }).format(date) + ' PKT';
  } catch {
    return 'N/A';
  }
};

const OrderDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

  const fetchOrder = useCallback(async () => {
    if (!id || !isValidObjectId(id)) {
      setError('Invalid order ID');
      setLoading(false);
      return;
    }

    try {
      const res = await getOrderById(id);
      setOrder(res.data);
      setLoading(false);
    } catch (err) {
      if (retryCount < MAX_RETRIES && err.response?.status >= 500) {
        setRetryCount((prev) => prev + 1);
      } else {
        setError(err.response?.data?.message || 'Failed to load order. Please try again.');
        setLoading(false);
      }
    }
  }, [id, retryCount]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center font-inter">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100/30 p-8 animate-pulse">
          <div className="flex items-center justify-center space-x-2">
            <svg className="animate-spin h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p className="text-lg font-medium text-gray-700">Loading Order Details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center font-inter">
        <div className="bg-red-50/90 backdrop-blur-md rounded-2xl shadow-2xl border border-red-100/50 p-8 animate-slide-up">
          <p className="text-lg font-medium text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl font-semibold shadow-md hover:shadow-lg hover:from-red-600 hover:to-red-700 transform hover:scale-[1.02] transition-all duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!order || !order._id || !order.products || !Array.isArray(order.products)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center font-inter">
        <div className="bg-yellow-50/90 backdrop-blur-md rounded-2xl shadow-2xl border border-yellow-100/50 p-8 animate-slide-up">
          <p className="text-lg font-medium text-yellow-600">Order data is incomplete or invalid.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 font-inter py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-8 animate-fade-in">
          Your Order Details
        </h1>

        <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-100/30 p-6 sm:p-8 animate-slide-up">
          {/* Order Summary */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Order Summary
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InfoCard title="Order ID" value={order._id} className="animate-slide-up" />
              <InfoCard
                title="Status"
                value={order.isPaid ? 'Paid' : 'Pending'}
                className={`animate-slide-up delay-100 ${order.isPaid ? 'text-green-600' : 'text-yellow-600'}`}
              />
              {order.isPaid && (
                <InfoCard
                  title="Payment Completed"
                  value={formatPKTDate(order.paymentCompletedAt || order.updatedAt)}
                  className="animate-slide-up delay-200"
                />
              )}
            </div>
          </section>

          {/* Shipping Address */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Shipping Address
            </h2>
            {order.shippingAddress ? (
              <div className="text-gray-700 animate-slide-up delay-300">
                <p className="text-base">{order.shippingAddress.street}</p>
                <p className="text-base">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                <p className="text-base">{order.shippingAddress.country}</p>
                {order.shippingAddress.notes && (
                  <p className="text-sm text-gray-600 mt-2">Notes: {order.shippingAddress.notes}</p>
                )}
              </div>
            ) : (
              <p className="text-gray-600 text-base animate-slide-up delay-300">No shipping address provided.</p>
            )}
          </section>

          {/* Order Items */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Order Items
            </h2>
            <div className="space-y-4">
              {order.products.length === 0 ? (
                <p className="text-gray-600 text-base font-medium animate-slide-up delay-400">
                  No items in this order.
                </p>
              ) : (
                order.products.map((p, index) => (
                  <OrderItem
                    key={p.product?._id || p._id}
                    product={p.product}
                    quantity={p.quantity}
                    className={`animate-slide-up delay-${400 + index * 100}`}
                  />
                ))
              )}
            </div>
          </section>

          {/* Total Price */}
          <section className="border-t border-gray-200/50 pt-6">
            <div className="flex justify-between items-center animate-slide-up delay-500">
              <p className="text-lg font-medium text-gray-500">Total Price</p>
              <p className="text-2xl font-bold text-indigo-600">
                ${order.totalPrice ? order.totalPrice.toFixed(2) : 'N/A'}
              </p>
            </div>
          </section>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .font-inter {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        .animate-slide-up {
          animation: slideUp 0.5s ease-in-out;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.3s; }
        .delay-500 { animation-delay: 0.4s; }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default OrderDetails;