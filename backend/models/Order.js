const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  creditCard: {
    type: String,
    required: true,
  },
  deliveryOption: {
    type: String,
    enum: ["delivery", "pickup"],
    required: true,
  },
  address: {
    type: String,
    required: function () {
      return this.deliveryOption === "delivery";
    },
  },
  store: {
    type: String,
    required: function () {
      return this.deliveryOption === "pickup";
    },
  },
  items: [
    {
      medicineName: String,
      quantity: Number,
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  orderStatus: {
    type: String,
    enum: ["pending", "shipped", "completed", "cancelled"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  order_id: {
    type: String,
    required: true,
    unique: true,
  },
  delivery_date: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("Order", orderSchema);
