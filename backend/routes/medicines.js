const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');

// Get all medicines (GET /api/medicines)
router.get('/', async (req, res) => {
  try {
    // Fetch all medicines from the database
    const medicines = await Medicine.find();
    console.log("Medicines found:", medicines); // Add logging here

    // If no medicines are found, send a 404 response
    if (medicines.length === 0) {
      return res.status(404).json({
        success: false,
        msg: 'No medicines found.'
      });
    }

    // Return 200 OK with medicines
    return res.status(200).json({
      success: true,
      msg: 'Medicines fetched successfully.',
      data: medicines
    });
  } catch (err) {
    console.error(err.message);

    // Return 500 Internal Server Error in case of an error
    return res.status(500).json({
      success: false,
      msg: 'Server error. Please try again later.'
    });
  }
});

module.exports = router;
