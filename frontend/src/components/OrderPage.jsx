import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import axios from "axios";
import "./CSS/OrderPage.css";

export default function OrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const baseURL = process.env.REACT_APP_API_BASE_URL;

  const fetchOrders = async () => {
    try {
      const userEmail = localStorage.getItem("email");
      if (!userEmail) {
        throw new Error("User email not found");
      }

      const response = await axios.get(`${baseURL}/orders/${userEmail}`);
      setOrders(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <>
      <Navbar />
      <div className="order-page">
        <h1>Your Orders</h1>

        {loading ? (
          <p>Loading your orders...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : orders.length === 0 ? (
          <p>No orders found for this account.</p>
        ) : (
          <div className="order-list">
            <div className="order-header">
              <div>Order ID</div>
              <div>Name</div>
              <div>Total Amount</div>
              <div>Medicine Name</div>
            </div>

            {orders.map((order) => (
              <div key={order._id} className="order-row">
                <div>{order._id}</div>
                <div>{order.customerName}</div>
                <div>${order.totalAmount}</div>
                <div>
                  {order.items.map((item, index) => (
                    <span key={index}>{item.medicineName}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
