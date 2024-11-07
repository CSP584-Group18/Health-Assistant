const express = require("express");
const router = express.Router();
const Order = require("../models/Order");

// Function to generate a unique order ID with "Order" followed by a random 3-digit integer
const generateOrderId = () => {
  const randomNum = Math.floor(100 + Math.random() * 900); // Random 3-digit integer
  return `Order${randomNum}`;
};

router.post("/", async (req, res) => {
  const {
    customerName,
    email,
    creditCard,
    deliveryOption,
    address,
    store,
    items,
    totalAmount,
  } = req.body;

  try {
    const newOrder = new Order({
      customerName,
      email,
      creditCard,
      deliveryOption,
      address: deliveryOption === "delivery" ? address : "",
      store: deliveryOption === "pickup" ? store : "",
      items,
      totalAmount,
      order_id: generateOrderId(), // Generate the order ID automatically
      delivery_date: new Date(),    // Set today's date as the default delivery date
    });

    await newOrder.save();
    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to place order", error });
  }
});

router.get("/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const userOrders = await Order.find({ email });

    if (userOrders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    res.status(200).json(userOrders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to retrieve orders", error });
  }
});

module.exports = router;
