const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
  medicineid: { type: Number, required: true },
  name: { type: String, required: true },
  activeingredient: { type: String, required: true },
  conditionstreated: { type: String, required: true },
  doseform: { type: String, required: true },
  dosage: { type: String, required: true },
  sideeffect: { type: String, required: true },
  agegroup: { type: String, required: true },
  prescriptionrequirement: { type: String, required: true },
  manufacturer: { type: String, required: true },
  severity: { type: String, required: true },
  price: { type: Number, required: true }
});

module.exports = mongoose.model('Medicine', MedicineSchema);
