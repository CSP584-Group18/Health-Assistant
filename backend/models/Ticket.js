const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  ticket_number: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  image_url: { type: String },
  created_at: { type: Date, default: Date.now },
  decision: { type: String }
});

module.exports = mongoose.model('Ticket', TicketSchema);