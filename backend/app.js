const express = require('express');
const axios = require('axios');
const connectDB = require('./config/db');
require('dotenv').config();

// Initialize the app
const app = express();

// Connect to the database
connectDB();

// Middleware setup to parse incoming JSON
app.use(express.json());

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/medicines', require('./routes/medicines'));
app.use('/api/conversations', require('./routes/conversations'));  // Ensure this is connected
app.use('/api/symptoms', require('./routes/symptoms'));

// Chatbot endpoint for external chatbot API interaction (if needed)
app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;

    try {
        const response = await axios.post('http://localhost:5005/webhooks/rest/webhook', {
            sender: 'user1',
            message: userMessage,
        });

        res.json(response.data);
    } catch (error) {
        res.status(500).send('Error communicating with chatbot');
    }
});

// Start the server
const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
