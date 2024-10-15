const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register User (POST /api/auth/register)
router.post('/register', async (req, res) => {
  const { firstName, lastName, age, email, password} = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ 
        success: false,
        msg: 'User already exists. Please log in.' 
      });
    }

    // Create a new user object
    user = new User({
      firstName,
      lastName,
      age,
      email,
      password
    });

    // Hash the password before saving the user
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save the user in the database
    await user.save();

    // Respond with the created user data (without password)
    const userData = {
      firstName: user.firstName,
      lastName: user.lastName,
      age: user.age,
      email: user.email,
      _id: user._id
    };

    // Return 201 Created status
    return res.status(201).json({
      success: true,
      msg: 'User registered successfully.',
      data: userData
    });
  } catch (err) {
    console.error(err.message);

    // Return 500 Internal Server Error
    return res.status(500).json({
      success: false,
      msg: 'Server error. Please try again later.'
    });
  }
});

// Login User (POST /api/auth/login)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false,
        msg: 'Invalid email. User does not exist.'
      });
    }

    // Compare the entered password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        msg: 'Invalid password. Please try again.' 
      });
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(payload, 'secretKey', { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;

      // Return 200 OK with JWT token
      return res.status(200).json({
        success: true,
        msg: 'Login successful.',
        token
      });
    });
  } catch (err) {
    console.error(err.message);

    // Return 500 Internal Server Error
    return res.status(500).json({
      success: false,
      msg: 'Server error. Please try again later.'
    });
  }
});

module.exports = router;
