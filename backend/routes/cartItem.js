const express = require('express');
const CartItem = require('../models/CartItem');
const router = express.Router();
 
// Add item to cart
router.post('/', async (req, res) => {
  const { email, medicineName, totalAmount, quantity } = req.body;

  try {
    const cartItem = new CartItem({
      email,
      medicineName,
      totalAmount,
      quantity
    });

    await cartItem.save();
    res.status(201).send(cartItem);
  } catch (error) {
    res.status(400).send({ error: 'Failed to add item to cart' });
  }
});

// Get all items in the cart for a specific user
router.get('/', async (req, res) => {
  const { email } = req.query; // Assuming email is passed as a query parameter

  try {
    // Find all cart items for the provided email
    const cartItems = await CartItem.find({ email });
    
    if (cartItems.length === 0) {
      return res.status(404).send({ error: 'No items found for this user' });
    }

    res.status(200).send(cartItems);
  } catch (error) {
    res.status(500).send({ error: 'Failed to retrieve cart items' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedItem = await CartItem.findByIdAndDelete(id);
    if (!deletedItem) {
      return res.status(404).send({ error: 'Cart item not found' });
    }
    res.status(200).send({ message: 'Cart item deleted successfully' });
  } catch (error) {
    res.status(500).send({ error: 'Failed to delete cart item' });
  }
});

// Export the router
module.exports = router;