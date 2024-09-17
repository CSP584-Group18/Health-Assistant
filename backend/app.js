const express = require('express');
const app = express();
const connectDB = require('./config/db');
require('dotenv').config();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Sample route
app.get('/', (req, res) => res.send('API is running'));

module.exports = app;
