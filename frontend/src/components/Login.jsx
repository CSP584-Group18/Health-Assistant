import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/Login.css';
import axios from "axios";

const baseURL = process.env.REACT_APP_API_BASE_URL;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post(`${baseURL}/auth/login`, {
        email,
        password
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const data = response.data;
  
      if (data.success) {
        localStorage.setItem('email', email);
        navigate('/dashboard');  // Redirect to dashboard on success
      } else {
        setError(data.message);  // Display error message if login failed
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <p style={{marginTop:'15px'}}>
        Don't have an account? <a href="/register">Sign Up</a>
      </p>
    </div>
  );
};

export default Login;
