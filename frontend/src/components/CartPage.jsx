import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CSS/CartPage.css';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const baseURL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchCartItems = async () => {
      const email = localStorage.getItem('email'); 

      if (!email) {
        setError('User email not found. Please log in.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${baseURL}/cart`, {
          params: { email }
        });
        setCartItems(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch cart items');
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <ul className="cart-items-list">
          {cartItems.map((item) => (
            <li key={item._id} className="cart-item">
              <h2>{item.medicineName}</h2>
              <p>Quantity: {item.quantity}</p>
              <p>Total Amount: ${item.totalAmount.toFixed(2)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CartPage;