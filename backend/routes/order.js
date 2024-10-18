const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

router.post('/', async (req, res) => {
  const { customerName, email, creditCard, deliveryOption, address, store, items, totalAmount } = req.body;

  try {
    const newOrder = new Order({
      customerName,
      email,
      creditCard,
      deliveryOption,
      address: deliveryOption === 'delivery' ? address : '',
      store: deliveryOption === 'pickup' ? store : '',
      items,
      totalAmount,
    });

    await newOrder.save();
    res.status(201).json({ message: 'Order placed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to place order', error });
  }
});

module.exports = router;
