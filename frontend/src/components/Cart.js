import { useSelector, useDispatch } from "react-redux";
import { removeFromCart, updateQuantity, clearCart } from "../redux/slices/cartSlice";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getImageUrl } from "../utils/image";

const Cart = () => {
  const { items } = useSelector((state) => state.cart);
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2);

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  return (
    <div className="container mx-auto px-6 py-12 bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen font-inter">
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-lg py-4 mb-10">
        <h1 className="text-3xl font-bold text-center tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-400 animate-gradient shift bg-[length:200%_100%]">
          🛒 Your Shopping Cart
        </h1>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-10 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100">
          <p className="text-gray-600 text-base mb-6 font-medium">Your cart is feeling a bit lonely...</p>
          <Link
            to="/"
            className="inline-block px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium text-sm rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300"
          >
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-5">
            {items.map((item) => (
              <div
                key={item._id}
                className="flex items-center bg-white/80 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-5 border border-gray-100/50 hover:scale-[1.01]"
              >
                <img
                  src={getImageUrl(item.image) || "https://via.placeholder.com/100"}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-xl border border-gray-200/50 transition-transform duration-300 hover:scale-105"
                />
                <div className="flex-grow ml-5">
                  <h2 className="text-base font-semibold text-gray-900 truncate hover:text-indigo-500 transition-colors duration-200">{item.name}</h2>
                  <p className="text-gray-800 text-sm font-medium">${item.price.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 font-medium">
                    Subtotal: ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  {item.quantity >= item.stock && (
                    <p className="text-xs text-red-500 font-medium animate-pulse">Max stock reached</p>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50/50 backdrop-blur-sm">
                    <button
                      onClick={() =>
                        dispatch(updateQuantity({ _id: item._id, quantity: item.quantity - 1 }))
                      }
                      disabled={item.quantity <= 1}
                      className={`px-3 py-1 text-gray-600 hover:bg-indigo-100 hover:text-indigo-500 transition-colors duration-200 text-sm ${
                        item.quantity <= 1 ? "opacity-40 cursor-not-allowed" : ""
                      }`}
                    >
                      −
                    </button>
                    <span className="px-4 py-1 text-gray-900 font-medium text-sm">{item.quantity}</span>
                    <button
                      onClick={() =>
                        dispatch(updateQuantity({ _id: item._id, quantity: item.quantity + 1 }))
                      }
                      disabled={item.quantity >= item.stock}
                      className={`px-3 py-1 text-gray-600 hover:bg-indigo-100 hover:text-indigo-500 transition-colors duration-200 text-sm ${
                        item.quantity >= item.stock ? "opacity-40 cursor-not-allowed" : ""
                      }`}
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => dispatch(removeFromCart(item._id))}
                    className="text-red-500 hover:text-red-600 font-medium text-sm transition-colors duration-200 hover:scale-110 transform"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <div className="flex justify-end mt-6">
              <button
                onClick={handleClearCart}
                className="px-5 py-2 bg-gradient-to-r from-red-500 to-red-700 text-white font-medium text-sm rounded-full shadow-md hover:shadow-lg hover:scale-105 transform transition-all duration-300"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 sticky top-16 border border-gray-100/50">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
                Order Summary
              </h2>
              <div className="flex justify-between mb-3 text-gray-700 text-sm">
                <span>Subtotal</span>
                <span>${total}</span>
              </div>
              <div className="flex justify-between mb-3 text-gray-700 text-sm">
                <span>Tax (Estimated)</span>
                <span>${(total * 0.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-base mt-5 pt-5 border-t border-gray-200/50">
                <span>Total</span>
                <span>${(parseFloat(total) + parseFloat(total) * 0.1).toFixed(2)}</span>
              </div>

              <Link
                to="/checkout"
                className="block w-full mt-6 px-6 py-3 bg-gradient-to-r from-green-500 to-green-700 text-white font-medium text-sm text-center rounded-full shadow-lg hover:shadow-xl hover:scale-105 transform transition-all duration-300"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          .font-inter {
            font-family: 'Inter', sans-serif;
          }
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-gradient {
            animation: gradientShift 4s ease infinite;
          }
          .shift {
            background-size: 200% 100%;
          }
        `}
      </style>
    </div>
  );
};

export default Cart;