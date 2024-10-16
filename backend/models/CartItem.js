
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  email: { type: String, required: true },
  medicineName: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  quantity: { type: Number, required: true }
});

module.exports = mongoose.model('CartItem', cartItemSchema);;