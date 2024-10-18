const express = require('express');
const cors = require('cors');
const axios = require('axios');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

connectDB();

app.use(cors({
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST', 'DELETE'],
    credentials: true 
}));
app.use(express.json());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/medicines', require('./routes/medicines'));
app.use('/api/conversations', require('./routes/conversations'));
app.use('/api/symptoms', require('./routes/symptoms'));
app.use('/api/cart', require('./routes/cartItem'));
app.use('/api/orders', require('./routes/order'));
app.use('/api/clear', require('./routes/clearCart'));

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

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
