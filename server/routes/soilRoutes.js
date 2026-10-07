const express = require('express');
const { resolveAhmedpurVillage } = require('../services/weatherService');
const { getSoilData, DEFAULT_SOIL_LOCATION } = require('../services/soilService');

const router = express.Router();

const getRequestedLocation = async (req) => {
  const hasLatitude = req.query.lat !== undefined;
  const hasLongitude = req.query.lon !== undefined;
  const latitude = Number(req.query.lat);
  const longitude = Number(req.query.lon);
  if (hasLatitude !== hasLongitude || (hasLatitude && (
    !Number.isFinite(latitude) || !Number.isFinite(longitude)
    || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180
  ))) {
    throw Object.assign(new Error('Provide valid latitude and longitude coordinates.'), { status: 400 });
  }

  if (hasLatitude) return { ...DEFAULT_SOIL_LOCATION, latitude, longitude, name: 'Visitor location' };
  if (req.query.village) return resolveAhmedpurVillage(req.query.village);
  return DEFAULT_SOIL_LOCATION;
};

router.get('/current', async (req, res) => {
  try {
    res.json(await getSoilData(await getRequestedLocation(req)));
  } catch (error) {
    res.status(error.status || (error.code === 'LOCATION_NOT_FOUND' ? 422 : 503)).json({
      source: 'NONE',
      error: error.code === 'LOCATION_NOT_FOUND' || error.status
        ? error.message
        : 'Public soil data is temporarily unavailable.',
      location: DEFAULT_SOIL_LOCATION
    });
  }
});

module.exports = router;
