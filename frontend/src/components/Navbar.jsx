import React from "react";
import "./CSS/Navbar.css";
import { Link, useNavigate } from "react-router-dom";

const image = process.env.PUBLIC_URL;

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleOrder = () => {
    navigate("/order");
  };

  return (
    <div className="nav-container">
      <div className="navbar">
        <div className="nav-logo">
          <Link to="/dashboard">
            <p>EliteCare</p>
          </Link>
        </div>
        <div className="nav-login-cart">
          <button onClick={handleOrder}>Order</button>
          <button onClick={handleLogout}>Logout</button>
          <Link to="/cart">
            <img
              src={`${image}/Assets/Medicines/cart_icon.png`}
              alt="cart_icon"
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
