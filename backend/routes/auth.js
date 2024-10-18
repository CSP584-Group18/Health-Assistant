const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

router.post("/register", async (req, res) => {
  const { firstName, lastName, age, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        msg: "User already exists. Please log in.",
      });
    }

    user = new User({
      firstName,
      lastName,
      age,
      email,
      password,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const userData = {
      firstName: user.firstName,
      lastName: user.lastName,
      age: user.age,
      email: user.email,
      _id: user._id,
    };

    return res.status(201).json({
      success: true,
      msg: "User registered successfully.",
      data: userData,
    });
  } catch (err) {
    console.error(err.message);

    return res.status(500).json({
      success: false,
      msg: "Server error. Please try again later.",
    });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        msg: "Invalid email. User does not exist.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        msg: "Invalid password. Please try again.",
      });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(payload, "secretKey", { expiresIn: 360000 }, (err, token) => {
      if (err) throw err;

      return res.status(200).json({
        success: true,
        msg: "Login successful.",
        token,
      });
    });
  } catch (err) {
    console.error(err.message);

    return res.status(500).json({
      success: false,
      msg: "Server error. Please try again later.",
    });
  }
});

module.exports = router;
