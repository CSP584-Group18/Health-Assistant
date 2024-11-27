import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import MedicineDetail from "./components/MedicineDetail";
import CartPage from "./components/CartPage";
import Checkout from "./components/Checkout";
import OrderPage from "./components/OrderPage";
import CustomerService from "./components/CustomerService";  // New CustomerService component

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/medicine/:id" element={<MedicineDetail />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/customer-service" element={<CustomerService />} />  {/* New route for Customer Service */}
      </Routes>
    </Router>
  );
};

export default App;
