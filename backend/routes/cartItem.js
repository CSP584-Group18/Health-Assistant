const express = require("express");
const CartItem = require("../models/CartItem");
const router = express.Router();

router.post("/", async (req, res) => {
  const { email, medicineName, totalAmount, quantity } = req.body;

  try {
    const cartItem = new CartItem({
      email,
      medicineName,
      totalAmount,
      quantity,
    });

    await cartItem.save();
    res.status(201).send(cartItem);
  } catch (error) {
    res.status(400).send({ error: "Failed to add item to cart" });
  }
});

router.get("/", async (req, res) => {
  const { email } = req.query;

  try {
    const cartItems = await CartItem.find({ email });

    if (cartItems.length === 0) {
      return res.status(404).send("Your cart is empty.");
    }

    res.status(200).send(cartItems);
  } catch (error) {
    res.status(500).send({ error: "Failed to retrieve cart items" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedItem = await CartItem.findByIdAndDelete(id);
    if (!deletedItem) {
      return res.status(404).send({ error: "Cart item not found" });
    }
    res.status(200).send({ message: "Cart item deleted successfully" });
  } catch (error) {
    res.status(500).send({ error: "Failed to delete cart item" });
  }
});

module.exports = router;
