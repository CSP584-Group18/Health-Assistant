const express = require("express");
const router = express.Router();
const Medicine = require("../models/Medicine");

router.get("/", async (req, res) => {
  try {
    const medicines = await Medicine.find();
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (medicine == null) {
      return res.status(404).json({ message: "Cannot find medicine" });
    }
    res.json(medicine);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
