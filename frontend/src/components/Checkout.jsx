import React, { useState } from 'react';
import './CSS/Checkout.css';

const Checkout = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    creditCard: '',
    deliveryOption: 'delivery', 
    address: '', 
    store: '', 
  });

  const stores = [
    { id: 1, name: 'Store 1 - Downtown' },
    { id: 2, name: 'Store 2 - Uptown' },
    { id: 3, name: 'Store 3 - East Side' },
    { id: 4, name: 'Store 4 - West Side' },
    { id: 5, name: 'Store 5 - Suburban' },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert('Order placed successfully!');
      } else {
        alert('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error placing order.');
    }
  };

  return (
    <div class="checkout-page">
    <form onSubmit={handleSubmit}>
      <h2>Checkout</h2>
      <div>
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Credit Card:</label>
        <input
          type="text"
          name="creditCard"
          value={formData.creditCard}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Delivery Option:</label>
        <select
          name="deliveryOption"
          value={formData.deliveryOption}
          onChange={handleChange}
        >
          <option value="delivery">Delivery</option>
          <option value="pickup">Store Pickup</option>
        </select>
      </div>

      {formData.deliveryOption === 'pickup' && (
        <div>
          <label>Select Store:</label>
          <select
            name="store"
            value={formData.store}
            onChange={handleChange}
            required
          >
            <option value="">-- Select a Store --</option>
            {stores.map((store) => (
              <option key={store.id} value={store.name}>
                {store.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {formData.deliveryOption === 'delivery' && (
        <div>
          <label>Address:</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>
      )}
      <button type="submit">Place Order</button>
    </form>
    </div>
  );
};

export default Checkout;
