const express = require('express');
const { getCurrentWeather, resolveLocationName, resolveAhmedpurVillage } = require('../services/weatherService');
const { DEFAULT_LOCATION } = require('../services/weatherService');
const router = express.Router();

const getRequestedLocation = async (req) => {
  if (req.query.village) {
    return resolveAhmedpurVillage(req.query.village);
  }

  const latitude = Number(req.query.lat);
  const longitude = Number(req.query.lon);
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;

  if (!hasCoordinates) return DEFAULT_LOCATION;

  return resolveLocationName({
    ...DEFAULT_LOCATION,
    latitude,
    longitude,
    name: 'Visitor location'
  });
};

const respondWithWeather = async (res, loader, key) => {
  try {
    const data = await loader();

    if (data && data.error) {
      return res.status(503).json({
        message: 'Weather data is currently unavailable from the configured weather sources.',
        source: data.source,
        error: data.error,
        [key]: []
      });
    }

    return res.json(data[key] ?? data);
  } catch (error) {
    const status = error.code === 'LOCATION_NOT_FOUND' ? 422 : 503;
    return res.status(status).json({ error: error.message || 'Weather location could not be resolved.' });
  }
};

router.get('/current', async (req, res) => {
  try {
    const location = await getRequestedLocation(req);
    const data = await getCurrentWeather(location);
    if (data && data.error) {
      return res.status(503).json(data);
    }
    res.json(data);
  } catch (error) {
    const status = error.code === 'LOCATION_NOT_FOUND' ? 422 : 503;
    res.status(status).json({ error: error.message || 'Weather location could not be resolved.' });
  }
});

router.get('/hourly', async (req, res) => {
  await respondWithWeather(res, async () => getCurrentWeather(await getRequestedLocation(req)), 'hourly');
});

router.get('/forecast', async (req, res) => {
  await respondWithWeather(res, async () => getCurrentWeather(await getRequestedLocation(req)), 'forecast');
});

router.get('/alerts', async (req, res) => {
  await respondWithWeather(res, async () => getCurrentWeather(await getRequestedLocation(req)), 'alerts');
});

module.exports = router;
