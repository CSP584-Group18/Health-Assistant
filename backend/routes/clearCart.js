// Assuming you have a Cart model
const express = require('express');
const router = express.Router();
const CartItem = require('../models/CartItem');

// @route DELETE /api/cart/clear
// @desc Clear cart for a specific user
router.delete('/', async (req, res) => {
    const { email } = req.query;
  
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
  
    try {
      // Find the user's cart by email and remove it
      const result = await CartItem.deleteMany({ email });
  
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'No cart found for this email' });
      }
  
      res.status(200).json({ message: 'Cart cleared successfully.' });
    } catch (error) {
      console.error('Error clearing cart:', error);
      res.status(500).json({ message: 'Failed to clear cart', error });
    }
  });

module.exports = router;
