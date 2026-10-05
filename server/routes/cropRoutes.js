const express = require('express');
const Crop = require('../models/Crop');
const router = express.Router();

router.get('/', async (req, res) => {
  const crops = await Crop.find();
  if (!crops.length) {
    return res.status(503).json({ message: 'No verified crop catalogue is configured.' });
  }
  return res.json(crops);
});

router.get('/:id', async (req, res) => {
  const crop = await Crop.findById(req.params.id);
  if (crop) return res.json(crop);

  return res.status(404).json({ message: 'Crop was not found in the configured catalogue.' });
});

router.post('/', async (req, res) => {
  const crop = await Crop.create(req.body);
  res.status(201).json(crop);
});

module.exports = router;
