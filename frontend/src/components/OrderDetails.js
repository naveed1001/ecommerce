import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { getOrderById } from '../services/api';

const OrderDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 2;

  // Validate MongoDB ObjectId
  const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id || !isValidObjectId(id)) {
        console.error('Invalid or missing order ID', { id, location });
        setError('Invalid order ID');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching order with ID:', id, { attempt: retryCount + 1 });
        const res = await getOrderById(id);
        console.log('Order data:', res.data);
        setOrder(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching order:', {
          orderId: id,
          status: err.response?.status,
          responseData: err.response?.data,
          message: err.message,
          attempt: retryCount + 1,
        });
        if (retryCount < maxRetries && err.response?.status >= 500) {
          console.log('Retrying fetchOrder...');
          setRetryCount(retryCount + 1);
        } else {
          setError(err.response?.data?.message || 'Failed to load order. Please try again.');
          setLoading(false);
        }
      }
    };

    fetchOrder();
  }, [id, retryCount]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100 p-6 animate-pulse">
          <p className="text-gray-600 text-lg font-medium">Loading Order Details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="bg-red-50/90 backdrop-blur-md rounded-2xl shadow-lg border border-red-100 p-6">
          <p className="text-red-600 text-lg font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-red-600 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Check if order or required fields are missing
  if (!order || !order._id || !order.products || !Array.isArray(order.products)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="bg-yellow-50/90 backdrop-blur-md rounded-2xl shadow-lg border border-yellow-100 p-6">
          <p className="text-yellow-600 text-lg font-medium">Order data is incomplete or invalid.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 font-inter py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-8 animate-fade-in">
          Order Details
        </h1>

        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-100/50 p-6 sm:p-8 animate-slide-up">
          {/* Order Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Order ID</p>
              <p className="text-lg font-semibold text-gray-900">{order._id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Status</p>
              <p className={`text-lg font-semibold ${order.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                {order.isPaid ? 'Paid' : 'Pending'}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.products.length === 0 ? (
                <p className="text-gray-600 text-base font-medium">No items in this order.</p>
              ) : (
                order.products.map((p) => (
                  <div
                    key={p.product?._id || p._id}
                    className="flex justify-between items-center bg-gray-50/50 rounded-xl p-4 hover:bg-gray-100/80 transition-all duration-300"
                  >
                    <div>
                      <p className="text-base font-medium text-gray-900">{p.product?.name || 'Unknown Product'}</p>
                      <p className="text-sm text-gray-600">Quantity: {p.quantity || 0}</p>
                    </div>
                    <p className="text-base font-semibold text-gray-900">
                      ${p.product?.price ? (p.product.price * p.quantity).toFixed(2) : 'N/A'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Total Price */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center">
              <p className="text-lg font-medium text-gray-500">Total Price</p>
              <p className="text-2xl font-bold text-indigo-600">
                ${order.totalPrice ? order.totalPrice.toFixed(2) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        .animate-slide-up {
          animation: slideUp 0.5s ease-in-out;
        }
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