import { useState } from 'react';
import { useSelector } from 'react-redux';
import { createOrder } from '../services/api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const CheckoutForm = () => {
  const { items } = useSelector((state) => state.cart);
  const [address, setAddress] = useState('');
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { clientSecret, order } = await createOrder({ products: items, shippingAddress: address, paymentMethod: 'stripe' });
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement) }
    });
    if (paymentIntent.status === 'succeeded') {
      // Update order as paid
      alert('Payment successful!');
    } else {
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="container mx-auto p-4 max-w-md">
      <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Shipping Address" className="border p-2 w-full mb-2" />
      <CardElement className="border p-2 mb-2" />
      <button type="submit" className="bg-blue-500 text-white p-2">Pay</button>
    </form>
  );
};

const Checkout = () => (
  <Elements stripe={stripePromise}>
    <CheckoutForm />
  </Elements>
);

export default Checkout;