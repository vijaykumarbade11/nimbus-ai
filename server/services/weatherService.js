const axios = require('axios');

const DEFAULT_LOCATION = {
  name: 'Ahmedpur, Latur, Maharashtra',
  latitude: 18.7058,
  longitude: 76.9367,
  timezone: 'Asia/Kolkata'
};

const IMD_BASE = (process.env.IMD_API_BASE_URL || 'https://api.imd.gov.in').replace(/\/$/, '');
const AGRO_BASE = (process.env.AGROWEATHER_API_URL || 'https://agromet.imd.gov.in').replace(/\/$/, '');
const PUBLIC_WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';
const REVERSE_GEOCODE_URL = 'https://nominatim.openstreetmap.org/reverse';
const PLACE_SEARCH_URL = 'https://photon.komoot.io/api/';
const villageLocationCache = new Map();

function buildWeatherError(message) {
  return {
    source: 'NONE',
    location: DEFAULT_LOCATION,
    error: message,
    current: {},
    hourly: [],
    forecast: [],
    alerts: []
  };
}

function toNumber(value, fallback = null) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function toDisplayValue(value) {
  return value == null || Number.isNaN(value) ? null : value;
}

function describeWeatherCode(code) {
  const descriptions = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Rime fog',
    51: 'Light drizzle',
    53: 'Drizzle',
    55: 'Heavy drizzle',
    61: 'Light rain',
    63: 'Rain',
    65: 'Heavy rain',
    71: 'Light snow',
    73: 'Snow',
    75: 'Heavy snow',
    80: 'Rain showers',
    81: 'Rain showers',
    82: 'Heavy rain showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Severe thunderstorm with hail'
  };

  return descriptions[code] || 'Weather update';
}

function normalizeWeatherData(payload, location = DEFAULT_LOCATION) {
  if (!payload || typeof payload !== 'object') return null;

  const current = payload.current || payload.data?.current || payload.currentWeather || {};
  const forecast = payload.forecast || payload.data?.forecast || payload.daily || [];
  const hourly = payload.hourly || payload.data?.hourly || [];
  const alerts = payload.alerts || payload.data?.alerts || [];

  if (!current && !Array.isArray(forecast) && !Array.isArray(hourly) && !Array.isArray(alerts)) {
    return null;
  }

  const normalizedCurrent = {
    temp: toDisplayValue(toNumber(current.temp ?? current.temperature ?? current.temperature_2m, null)),
    feelsLike: toDisplayValue(toNumber(current.feelsLike ?? current.feels_like ?? current.apparent_temperature, null)),
    humidity: toDisplayValue(toNumber(current.humidity ?? current.relative_humidity_2m, null)),
    wind: toDisplayValue(toNumber(current.wind ?? current.wind_speed ?? current.windSpeed, null)),
    rainProbability: toDisplayValue(toNumber(current.rainProbability ?? current.precipitation_probability ?? current.precipitationProbability, null)),
    rainfall: toDisplayValue(toNumber(current.rainfall ?? current.precipitation ?? current.rain, null)),
    condition: current.condition || current.summary || 'Weather update',
    alert: current.alert || current.alertType || 'Weather alert',
    alertMessage: current.alertMessage || current.message || 'Official weather data is being refreshed.'
  };

  return {
    source: payload.source || 'REAL',
    location,
    current: normalizedCurrent,
    hourly: Array.isArray(hourly) ? hourly : [],
    forecast: Array.isArray(forecast) ? forecast : [],
    alerts: Array.isArray(alerts) ? alerts : []
  };
}

async function fetchJson(url, params = {}) {
  const response = await axios.get(url, {
    params,
    timeout: 10000,
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Nimbus-AI/1.0'
    }
  });

  return response.data;
}

async function resolveLocationName(location) {
  if (!location || location.name !== 'Visitor location') return location;

  try {
    const data = await fetchJson(REVERSE_GEOCODE_URL, {
      format: 'jsonv2',
      lat: location.latitude,
      lon: location.longitude,
      zoom: 10,
      addressdetails: 1
    });
    const address = data?.address || {};
    const name = address.city || address.town || address.village || address.suburb || 'Visitor location';
    return { ...location, name: `${name}, ${address.state_district || address.state || 'India'}` };
  } catch (error) {
    return location;
  }
}

async function resolveAhmedpurVillage(village) {
  const requestedName = String(village || '').trim();
  if (!requestedName || requestedName.length > 100) {
    throw Object.assign(new Error('Choose a valid village in Ahmedpur taluka.'), { code: 'LOCATION_NOT_FOUND' });
  }

  const normalizedName = requestedName.replace(/\s*\([^)]*\)/g, '').trim().toLocaleLowerCase();
  const cacheKey = normalizedName;
  if (villageLocationCache.has(cacheKey)) return villageLocationCache.get(cacheKey);

  if (normalizedName === 'ahmedpur' || normalizedName === 'ahmadpur') {
    const location = { ...DEFAULT_LOCATION };
    villageLocationCache.set(cacheKey, location);
    return location;
  }

  let data;
  try {
    data = await fetchJson(PLACE_SEARCH_URL, {
      q: `${requestedName}, Ahmedpur, Latur, Maharashtra, India`,
      limit: 10
    });
  } catch (error) {
    throw Object.assign(new Error('The village map lookup is temporarily unavailable. Try again or use your device location.'), {
      code: 'LOCATION_LOOKUP_UNAVAILABLE',
      cause: error
    });
  }
  const matchingPlace = data?.features?.find((feature) => {
    const properties = feature.properties || {};
    const name = String(properties.name || '').replace(/\s*\([^)]*\)/g, '').trim().toLocaleLowerCase();
    return name === normalizedName
      && properties.country === 'India'
      && properties.state === 'Maharashtra'
      && /ahmadpur|ahmedpur/i.test(properties.county || '')
      && ['city', 'town', 'village', 'locality'].includes(properties.type);
  });

  const coordinates = matchingPlace?.geometry?.coordinates;
  if (!Array.isArray(coordinates) || !Number.isFinite(coordinates[0]) || !Number.isFinite(coordinates[1])) {
    throw Object.assign(new Error(`A verified map location for ${requestedName}, Ahmedpur taluka could not be found. Use your device location or select another village.`), {
      code: 'LOCATION_NOT_FOUND'
    });
  }

  const location = {
    name: `${requestedName}, Ahmedpur taluka, Latur`,
    longitude: coordinates[0],
    latitude: coordinates[1],
    timezone: 'Asia/Kolkata'
  };
  villageLocationCache.set(cacheKey, location);
  return location;
}

async function fetchFromImd(location = DEFAULT_LOCATION) {
  const candidateUrls = [
    `${IMD_BASE}/api/imd`,
    `${IMD_BASE}/v3/wx`,
    `${IMD_BASE}/imd_json`
  ];

  for (const url of candidateUrls) {
    try {
      const data = await fetchJson(url, {
        lat: location.latitude,
        lon: location.longitude
      });
      const normalized = normalizeWeatherData(data, location);
      if (normalized) return { ...normalized, source: 'IMD' };
    } catch (error) {
      // Try the next official source.
    }
  }

  return null;
}

async function fetchFromAgroweather(location = DEFAULT_LOCATION) {
  const candidateUrls = [
    `${AGRO_BASE}/api/agroweather`,
    `${AGRO_BASE}/api/weather`,
    `${AGRO_BASE}/agromet/weather`,
    `${AGRO_BASE}/weather`
  ];

  for (const url of candidateUrls) {
    try {
      const data = await fetchJson(url, {
        lat: location.latitude,
        lon: location.longitude
      });
      const normalized = normalizeWeatherData(data, location);
      if (normalized) return { ...normalized, source: 'AGROWEATHER' };
    } catch (error) {
      // Try the next official source.
    }
  }

  return null;
}

async function fetchFromPublicWeather(location = DEFAULT_LOCATION) {
  const data = await fetchJson(PUBLIC_WEATHER_URL, {
    latitude: location.latitude,
    longitude: location.longitude,
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,cloud_cover,pressure_msl',
    hourly: 'temperature_2m,precipitation_probability,precipitation,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum',
    timezone: location.timezone,
    forecast_days: 5,
    models: 'best_match'
  });

  if (!data?.current || !data?.daily?.time) return null;

  const currentCode = data.current.weather_code;
  const currentHourIndex = Array.isArray(data.hourly?.time)
    ? data.hourly.time.findIndex((time) => time >= data.current.time)
    : -1;
  return {
    source: 'OPEN_METEO_PUBLIC',
    location,
    current: {
      temp: toDisplayValue(toNumber(data.current.temperature_2m)),
      feelsLike: toDisplayValue(toNumber(data.current.apparent_temperature)),
      humidity: toDisplayValue(toNumber(data.current.relative_humidity_2m)),
      wind: toDisplayValue(toNumber(data.current.wind_speed_10m)),
      rainProbability: currentHourIndex >= 0
        ? toDisplayValue(toNumber(data.hourly.precipitation_probability?.[currentHourIndex]))
        : null,
      rainfall: toDisplayValue(toNumber(data.current.precipitation)),
      condition: describeWeatherCode(currentCode),
      updatedAt: data.current.time || null,
      windDirection: toDisplayValue(toNumber(data.current.wind_direction_10m)),
      windGust: toDisplayValue(toNumber(data.current.wind_gusts_10m)),
      cloudCover: toDisplayValue(toNumber(data.current.cloud_cover)),
      pressure: toDisplayValue(toNumber(data.current.pressure_msl)),
      alert: 'Public weather data',
      alertMessage: `Model-estimated weather for ${location.name}. This is not a reading from a local weather station.`
    },
    hourly: Array.isArray(data.hourly?.time) ? data.hourly.time.slice(0, 24).map((time, index) => ({
      time,
      temp: toDisplayValue(toNumber(data.hourly.temperature_2m?.[index])),
      rainProbability: toDisplayValue(toNumber(data.hourly.precipitation_probability?.[index])),
      rainfall: toDisplayValue(toNumber(data.hourly.precipitation?.[index])),
      condition: describeWeatherCode(data.hourly.weather_code?.[index])
    })) : [],
    forecast: data.daily.time.map((date, index) => ({
      day: index === 0 ? 'Today' : new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', timeZone: location.timezone }),
      date,
      temp: toDisplayValue(toNumber(data.daily.temperature_2m_max?.[index])),
      minTemp: toDisplayValue(toNumber(data.daily.temperature_2m_min?.[index])),
      rainProbability: toDisplayValue(toNumber(data.daily.precipitation_probability_max?.[index])),
      rainfall: toDisplayValue(toNumber(data.daily.precipitation_sum?.[index])),
      condition: describeWeatherCode(data.daily.weather_code?.[index])
    })),
    alerts: []
  };
}

async function fetchRealWeather(location = DEFAULT_LOCATION) {
  const sourceAttempts = [fetchFromPublicWeather];
  if (process.env.IMD_API_BASE_URL) sourceAttempts.push(fetchFromImd);
  if (process.env.AGROWEATHER_API_URL) sourceAttempts.push(fetchFromAgroweather);
  let lastError = null;

  for (const sourceLoader of sourceAttempts) {
    try {
      const result = await sourceLoader(location);
      if (result) return result;
    } catch (error) {
      lastError = error;
    }
  }

  return { ...buildWeatherError(lastError ? `Unable to fetch weather data: ${lastError.message}` : 'The weather provider is not available right now.'), location };
}

module.exports = {
  DEFAULT_LOCATION,
  getCurrentWeather: fetchRealWeather,
  getHourlyWeather: fetchRealWeather,
  getForecast: fetchRealWeather,
  getAlerts: fetchRealWeather,
  resolveLocationName,
  resolveAhmedpurVillage
};
