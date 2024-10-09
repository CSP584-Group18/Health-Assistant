const express = require('express');
const router = express.Router();
const Symptom = require('../models/Symptom');

router.post('/', async (req, res) => {
  const { symptoms, severity, frequency } = req.body;

  try {
    const symptomEntry = new Symptom({
      userId: req.user.id,
      symptoms,
      severity,
      frequency
    });

    await symptomEntry.save();
    res.json(symptomEntry);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
