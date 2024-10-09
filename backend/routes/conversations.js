const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');

router.post('/', async (req, res) => {
  const { messages } = req.body;

  try {
    const conversation = new Conversation({
      userId: req.user.id,
      messages
    });

    await conversation.save();
    res.json(conversation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
