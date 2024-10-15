import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CSS/Signup.css"; // Ensure this imports your shared CSS file

const baseURL = process.env.REACT_APP_API_BASE_URL;

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const { firstName, lastName, age, email, password } = formData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      const response = await axios.post(
        `${baseURL}/auth/register`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;

      if (!response.status === 200) {
        throw new Error(data.msg || "Registration failed. Please try again.");
      }

      setSuccessMessage(data.msg);

      setTimeout(() => {
        navigate("/login"); // Redirect to login after 2 seconds on success
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.msg || err.message);
    }
  };

  return (
    <div className="form-container">
      <h2>Sign Up</h2>
      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>First Name:</label>
          <input
            type="text"
            name="firstName"
            value={firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Last Name:</label>
          <input
            type="text"
            name="lastName"
            value={lastName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Age:</label>
          <input
            type="number"
            name="age"
            value={age}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Sign Up</button>
      </form>
      <p>
        Already have an account? <a href="/login">Log in here</a>
      </p>
    </div>
  );
};

export default Signup;
