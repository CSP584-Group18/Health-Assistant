const express = require('express');
const router = express.Router();
const axios = require('axios');  
const Conversation = require('../models/Conversation');

router.post('/', async (req, res) => {
  const { messages } = req.body;
  const userMessage = messages[messages.length - 1].message;

  try {
    const rasaResponse = await axios.post('http://localhost:5005/webhooks/rest/webhook', {
      sender: "user1",  
      message: userMessage
    });

    const rasaMessages = rasaResponse.data.map((response) => ({
      sender: 'bot',
      message: response.text, 
      timestamp: Date.now()
    }));

    const conversation = new Conversation({
      userId: new mongoose.Types.ObjectId(),  
      messages: [
        ...messages, 
        ...rasaMessages 
      ]
    });

    await conversation.save();

    res.json(conversation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
