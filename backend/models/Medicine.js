const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  _id: String,
  medicine_name: String,
  price: Number,
  description: String,
  side_effects: [String],
  dosage: String,
});

module.exports = mongoose.model('Medicine', medicineSchema);
