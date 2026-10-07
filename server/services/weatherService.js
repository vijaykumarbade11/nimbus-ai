const axios = require('axios');

const DEFAULT_LOCATION = {
  name: 'Ahmedpur, Latur, Maharashtra',
  latitude: 18.7058,
  longitude: 76.9367,
  timezone: 'Asia/Kolkata'
};

const IMD_BASE = (process.env.IMD_API_BASE_URL || 'https://api.imd.gov.in').replace(/\/$/, '');
const AGRO_BASE = (process.env.AGROWEATHER_API_URL || 'https://agromet.imd.gov.in').replace(/\/$/, '');
const OPENWEATHER_CURRENT_URL = 'https://api.openweathermap.org/data/2.5/weather';
const OPENWEATHER_FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';
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

  const normalizeVillageName = (name) => name
    .replace(/\s*\([^)]*\)/g, '')
    .toLocaleLowerCase()
    .replace(/shirur/g, 'sirur')
    .replace(/[^a-z0-9]/g, '');
  const normalizedName = normalizeVillageName(requestedName);
  const requestedWithSubdivision = requestedName
    .toLocaleLowerCase()
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9]/g, '');
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
    const name = normalizeVillageName(String(properties.name || ''));
    const isKnownDhanoriBkMapAlias = requestedWithSubdivision === 'dhanoribk' && name === 'dhanorabk';
    return (name === normalizedName || isKnownDhanoriBkMapAlias)
      && String(properties.country || '').toLocaleLowerCase() === 'india'
      && /maharashtra/i.test(properties.state || '')
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

function openWeatherDate(timestamp, timezoneOffset) {
  return new Date((timestamp + timezoneOffset) * 1000).toISOString().slice(0, 10);
}

function describeOpenWeather(weather = {}) {
  const id = Number(weather.id);
  if (id >= 200 && id < 300) return 'Thunderstorm';
  if (id >= 300 && id < 400) return 'Drizzle';
  if (id === 500) return 'Light rain';
  if (id === 501) return 'Rain';
  if (id >= 502 && id < 600) return 'Heavy rain';
  if (id >= 600 && id < 700) return 'Snow';
  if (id >= 700 && id < 800) return 'Fog';
  if (id === 800) return 'Clear sky';
  if (id === 801) return 'Mainly clear';
  if (id === 802) return 'Partly cloudy';
  if (id >= 803 && id < 900) return 'Overcast';
  const description = String(weather.description || 'Weather update');
  return description.charAt(0).toLocaleUpperCase() + description.slice(1);
}

async function fetchFromOpenWeather(location = DEFAULT_LOCATION) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) return null;

  try {
    const params = {
      lat: location.latitude,
      lon: location.longitude,
      appid: apiKey,
      units: 'metric'
    };
    const [currentResponse, forecastResponse] = await Promise.all([
      axios.get(OPENWEATHER_CURRENT_URL, { params, timeout: 12000 }),
      axios.get(OPENWEATHER_FORECAST_URL, { params, timeout: 12000 })
    ]);
    const currentData = currentResponse.data;
    const forecastData = forecastResponse.data;
    if (!currentData?.main || !Array.isArray(forecastData?.list)) {
      throw new Error('OpenWeather returned incomplete current or forecast data.');
    }

    const timezoneOffset = toNumber(currentData.timezone, 0);
    const forecastsByDay = new Map();
    forecastData.list.forEach((item) => {
      if (!Number.isFinite(item.dt) || !item.main) return;
      const date = openWeatherDate(item.dt, timezoneOffset);
      if (!forecastsByDay.has(date)) {
        forecastsByDay.set(date, {
          date,
          temps: [],
          rainProbability: [],
          rainfall: 0,
          conditionItem: item
        });
      }
      const day = forecastsByDay.get(date);
      if (Number.isFinite(item.main.temp_min)) day.temps.push(item.main.temp_min);
      if (Number.isFinite(item.main.temp_max)) day.temps.push(item.main.temp_max);
      if (Number.isFinite(item.pop)) day.rainProbability.push(item.pop * 100);
      day.rainfall += toNumber(item.rain?.['3h'], 0);
      if (Math.abs((item.dt - currentData.dt) - 43200) < Math.abs((day.conditionItem.dt - currentData.dt) - 43200)) {
        day.conditionItem = item;
      }
    });

    const forecast = Array.from(forecastsByDay.values()).slice(0, 5).map((day, index) => ({
      day: index === 0 ? 'Today' : new Date(`${day.date}T12:00:00Z`).toLocaleDateString('en-IN', { weekday: 'short', timeZone: 'UTC' }),
      date: day.date,
      temp: day.temps.length ? Math.max(...day.temps) : null,
      minTemp: day.temps.length ? Math.min(...day.temps) : null,
      rainProbability: day.rainProbability.length ? Math.max(...day.rainProbability) : null,
      rainfall: Number(day.rainfall.toFixed(1)),
      condition: describeOpenWeather(day.conditionItem.weather?.[0])
    }));
    if (!forecast.length) throw new Error('OpenWeather returned no usable forecast periods.');

    const closestForecast = forecastData.list.reduce((closest, item) => (
      !closest || Math.abs(item.dt - currentData.dt) < Math.abs(closest.dt - currentData.dt) ? item : closest
    ), null);
    const currentRainProbability = Number.isFinite(closestForecast?.pop) ? closestForecast.pop * 100 : null;
    const currentWeather = currentData.weather?.[0] || {};
    const place = [currentData.name, currentData.sys?.country].filter(Boolean).join(', ');
    const resolvedLocation = place && location.name === 'Visitor location'
      ? { ...location, name: place }
      : location;

    return {
      source: 'OPENWEATHERMAP',
      location: resolvedLocation,
      current: {
        temp: toDisplayValue(toNumber(currentData.main.temp)),
        feelsLike: toDisplayValue(toNumber(currentData.main.feels_like)),
        humidity: toDisplayValue(toNumber(currentData.main.humidity)),
        wind: toDisplayValue(toNumber(currentData.wind?.speed) == null ? null : Number((currentData.wind.speed * 3.6).toFixed(1))),
        rainProbability: toDisplayValue(currentRainProbability),
        rainfall: toDisplayValue(toNumber(currentData.rain?.['1h'] ?? currentData.rain?.['3h'])),
        condition: describeOpenWeather(currentWeather),
        updatedAt: currentData.dt ? new Date(currentData.dt * 1000).toISOString() : null,
        windDirection: toDisplayValue(toNumber(currentData.wind?.deg)),
        windGust: toDisplayValue(toNumber(currentData.wind?.gust) == null ? null : Number((currentData.wind.gust * 3.6).toFixed(1))),
        cloudCover: toDisplayValue(toNumber(currentData.clouds?.all)),
        pressure: toDisplayValue(toNumber(currentData.main.pressure)),
        alert: 'OpenWeather forecast',
        alertMessage: `OpenWeather model data for ${resolvedLocation.name}. This is not a reading from a local weather station.`
      },
      hourly: forecastData.list.slice(0, 8).map((item) => ({
        time: item.dt ? new Date(item.dt * 1000).toISOString() : null,
        temp: toDisplayValue(toNumber(item.main?.temp)),
        rainProbability: toDisplayValue(Number.isFinite(item.pop) ? item.pop * 100 : null),
        rainfall: toDisplayValue(toNumber(item.rain?.['3h'])),
        condition: describeOpenWeather(item.weather?.[0])
      })),
      forecast,
      alerts: []
    };
  } catch (error) {
    const status = error.response?.status;
    const reason = status === 401 ? 'OpenWeather rejected the API key.'
      : status === 429 ? 'OpenWeather request limit reached.'
        : status ? `OpenWeather returned HTTP ${status}.`
          : 'OpenWeather could not be reached or returned incomplete data.';
    throw new Error(reason);
  }
}

async function fetchRealWeather(location = DEFAULT_LOCATION) {
  const sourceAttempts = [];
  if (process.env.OPENWEATHER_API_KEY) sourceAttempts.push(fetchFromOpenWeather);
  sourceAttempts.push(fetchFromPublicWeather);
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
  resolveAhmedpurVillage,
  fetchFromOpenWeather
};
