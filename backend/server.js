const express = require('express');
const cors = require('cors');
const axios = require('axios');
const connectDB = require('./config/db');
require('dotenv').config();

// Initialize the app
const app = express();

// Connect to the database
connectDB();

app.use(cors({
    origin: 'http://localhost:3000', // Your frontend URL
    methods: ['GET', 'POST'], // Specify allowed methods
    credentials: true // Allow credentials if needed (e.g., cookies)
}));

// Middleware setup to parse incoming JSON
app.use(express.json());

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/medicines', require('./routes/medicines'));
app.use('/api/conversations', require('./routes/conversations'));
app.use('/api/symptoms', require('./routes/symptoms'));
app.use('/api/orders', require('./routes/order'));

// Chatbot endpoint
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
