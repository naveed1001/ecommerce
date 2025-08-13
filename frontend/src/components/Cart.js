import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity } from '../redux/slices/cartSlice';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Cart = () => {
  const { items } = useSelector((state) => state.cart);
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl">Shopping Cart</h1>
      {items.map((item) => (
        <div key={item.id} className="flex justify-between border-b py-2">
          <span>{item.name} x {item.quantity}</span>
          <span>${item.price * item.quantity}</span>
          <button onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}>+</button>
          <button onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))} disabled={item.quantity <= 1}>-</button>
          <button onClick={() => dispatch(removeFromCart(item.id))} className="text-red-500">Remove</button>
        </div>
      ))}
      <p>Total: ${total}</p>
      <Link to="/checkout" className="bg-green-500 text-white p-2">Checkout</Link>
    </div>
  );
};

export default Cart;