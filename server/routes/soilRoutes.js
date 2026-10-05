const express = require('express');
const { getSoilData, DEFAULT_SOIL_LOCATION } = require('../services/soilService');

const router = express.Router();

const getRequestedLocation = (req) => {
  const latitude = Number(req.query.lat);
  const longitude = Number(req.query.lon);
  const valid = Number.isFinite(latitude) && Number.isFinite(longitude)
    && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;

  return valid
    ? { ...DEFAULT_SOIL_LOCATION, latitude, longitude, name: 'Visitor location' }
    : DEFAULT_SOIL_LOCATION;
};

router.get('/current', async (req, res) => {
  try {
    res.json(await getSoilData(getRequestedLocation(req)));
  } catch (error) {
    res.status(503).json({
      source: 'NONE',
      error: 'Public soil data is temporarily unavailable.',
      location: getRequestedLocation(req)
    });
  }
});

module.exports = router;
