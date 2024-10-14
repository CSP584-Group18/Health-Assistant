import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Import the CSS file

const Dashboard = () => {
  const navigate = useNavigate();

  // Function to handle navigation to different pages
  const handleNavigation = (page) => {
    navigate(page);
  };

  return (
    <div className="container">
      <h1>Welcome to the Dashboard!</h1>

      {/* Navigation buttons */}
      <div className="buttons-container">
        <button onClick={() => handleNavigation('/profile')} className="button">
          Profile
        </button>
        <button onClick={() => handleNavigation('/cart')} className="button">
          Cart
        </button>
        <button onClick={() => handleNavigation('/home')} className="button">
          Home
        </button>
      </div>

      {/* Categories Section */}
      <div className="categories-container">
        <h2>Product Categories</h2>
        <div className="categories-grid">
          <div className="category-circle">Smart Doorbells</div>
          <div className="category-circle">Smart Doorlocks</div>
          <div className="category-circle">Smart Speakers</div>
          <div className="category-circle">Smart Lightings</div>
          <div className="category-circle">Smart Thermostats</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
