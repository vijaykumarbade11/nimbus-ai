const express = require('express');
const { getCurrentWeather, resolveLocationName, resolveAhmedpurVillage } = require('../services/weatherService');
const { DEFAULT_LOCATION } = require('../services/weatherService');
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

  if (!hasLatitude) {
    return req.query.village ? resolveAhmedpurVillage(req.query.village) : DEFAULT_LOCATION;
  }

  return {
    ...DEFAULT_LOCATION,
    latitude,
    longitude,
    name: 'Visitor location'
  };
};

const getWeatherForRequest = async (req) => {
  const location = await getRequestedLocation(req);
  if (location.name !== 'Visitor location') return getCurrentWeather(location);

  const locationName = resolveLocationName(location);
  const nameOrFallback = Promise.race([
    locationName,
    new Promise((resolve) => setTimeout(() => resolve(location), 1500))
  ]);
  const [weather, resolvedLocation] = await Promise.all([
    getCurrentWeather(location),
    nameOrFallback
  ]);
  if (weather?.location?.name === 'Visitor location') weather.location = resolvedLocation;
  return weather;
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
    const status = error.status || (error.code === 'LOCATION_NOT_FOUND' ? 422 : 503);
    return res.status(status).json({ error: error.message || 'Weather location could not be resolved.' });
  }
};

router.get('/current', async (req, res) => {
  try {
    const data = await getWeatherForRequest(req);
    if (data && data.error) {
      return res.status(503).json(data);
    }
    res.json(data);
  } catch (error) {
    const status = error.status || (error.code === 'LOCATION_NOT_FOUND' ? 422 : 503);
    res.status(status).json({ error: error.message || 'Weather location could not be resolved.' });
  }
});

router.get('/hourly', async (req, res) => {
  await respondWithWeather(res, async () => getWeatherForRequest(req), 'hourly');
});

router.get('/forecast', async (req, res) => {
  await respondWithWeather(res, async () => getWeatherForRequest(req), 'forecast');
});

router.get('/alerts', async (req, res) => {
  await respondWithWeather(res, async () => getWeatherForRequest(req), 'alerts');
});

module.exports = router;
