const express = require('express');
const router = express.Router();
const axios = require('axios');  // Use axios to send requests to Rasa
const Conversation = require('../models/Conversation');

// POST route to handle chatbot messages
router.post('/', async (req, res) => {
  const { messages } = req.body;
  const userMessage = messages[messages.length - 1].message;

  try {
    // Send the user message to the Rasa server
    const rasaResponse = await axios.post('http://localhost:5005/webhooks/rest/webhook', {
      sender: "user1",  // Sender ID (can be dynamically assigned)
      message: userMessage
    });

    // Assuming Rasa response is in an array of message objects
    const rasaMessages = rasaResponse.data.map((response) => ({
      sender: 'bot',
      message: response.text,  // Rasa returns the response in the 'text' field
      timestamp: Date.now()
    }));

    // Combine user and Rasa bot responses in the conversation
    const conversation = new Conversation({
      userId: new mongoose.Types.ObjectId(),  // Use ObjectId
      messages: [
        ...messages,  // Include the user's messages
        ...rasaMessages  // Include Rasa bot's responses
      ]
    });

    // Save the conversation
    await conversation.save();

    // Respond with the updated conversation (including Rasa's responses)
    res.json(conversation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
