const mongoose = require("mongoose");

const SymptomSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  symptoms: [{ type: String, required: true }],
  severity: { type: String, required: true },
  frequency: { type: String, required: true },
  reportedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Symptom", SymptomSchema);
