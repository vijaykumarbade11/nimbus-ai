const test = require('node:test');
const assert = require('node:assert/strict');
const axios = require('axios');
const { fetchFromOpenWeather, getCurrentWeather, resolveAhmedpurVillage } = require('../services/weatherService');

test('OpenWeather data is normalized into the weather API response shape', async () => {
  const originalGet = axios.get;
  const originalApiKey = process.env.OPENWEATHER_API_KEY;
  process.env.OPENWEATHER_API_KEY = 'test-weather-key';
  let calls = 0;
  axios.get = async (url, options) => {
    calls += 1;
    assert.equal(options.params.appid, 'test-weather-key');
    assert.equal(options.params.units, 'metric');
    if (url.endsWith('/weather')) {
      return {
        data: {
          name: 'Ahmedpur',
          timezone: 19800,
          dt: 1770000000,
          main: { temp: 25, feels_like: 26, humidity: 55, pressure: 1008 },
          wind: { speed: 3, deg: 180, gust: 4 },
          clouds: { all: 20 },
          weather: [{ description: 'clear sky' }]
        }
      };
    }
    return {
      data: {
        list: [{
          dt: 1770000000,
          main: { temp: 25, temp_min: 22, temp_max: 27 },
          pop: 0.4,
          rain: { '3h': 1.5 },
          weather: [{ description: 'clear sky' }]
        }]
      }
    };
  };

  try {
    const data = await getCurrentWeather({
      name: 'Ahmedpur, Latur, Maharashtra',
      latitude: 18.7,
      longitude: 76.9,
      timezone: 'Asia/Kolkata'
    });
    assert.equal(calls, 2);
    assert.equal(data.source, 'OPENWEATHERMAP');
    assert.equal(data.current.temp, 25);
    assert.equal(data.current.wind, 10.8);
    assert.equal(data.current.rainProbability, 40);
    assert.equal(data.forecast.length, 1);
    assert.equal(data.forecast[0].rainfall, 1.5);
    assert.equal(data.hourly.length, 1);
  } finally {
    axios.get = originalGet;
    if (originalApiKey === undefined) delete process.env.OPENWEATHER_API_KEY;
    else process.env.OPENWEATHER_API_KEY = originalApiKey;
  }
});

test('OpenWeather errors never include the API key in their message', async () => {
  const originalGet = axios.get;
  const originalApiKey = process.env.OPENWEATHER_API_KEY;
  process.env.OPENWEATHER_API_KEY = 'secret-test-key';
  axios.get = async () => {
    throw new Error('Request failed: appid=secret-test-key');
  };

  try {
    await assert.rejects(
      fetchFromOpenWeather(),
      (error) => !error.message.includes('secret-test-key')
    );
  } finally {
    axios.get = originalGet;
    if (originalApiKey === undefined) delete process.env.OPENWEATHER_API_KEY;
    else process.env.OPENWEATHER_API_KEY = originalApiKey;
  }
});

test('Ahmedpur village lookup accepts the common Shirur/Sirur spelling variation', async () => {
  const originalGet = axios.get;
  axios.get = async (url, options) => {
    assert.equal(options.params.q, 'Shirur Tajband, Ahmedpur, Latur, Maharashtra, India');
    return {
      data: {
        features: [{
          properties: {
            name: 'Sirur Tajband',
            country: 'India',
            state: 'Maharashtra',
            county: 'Ahmadpur',
            type: 'city'
          },
          geometry: { coordinates: [76.5, 18.6] }
        }]
      }
    };
  };

  try {
    const location = await resolveAhmedpurVillage('Shirur Tajband');
    assert.equal(location.longitude, 76.5);
    assert.equal(location.latitude, 18.6);
    assert.match(location.name, /Shirur Tajband/);
  } finally {
    axios.get = originalGet;
  }
});

test('Ahmedpur Dhanori (Bk) resolves the verified Dhanora Bk map spelling', async () => {
  const originalGet = axios.get;
  axios.get = async (url, options) => {
    assert.equal(options.params.q, 'Dhanori (Bk), Ahmedpur, Latur, Maharashtra, India');
    return {
      data: {
        features: [{
          properties: {
            name: 'Dhanora Bk',
            country: 'India',
            state: 'Maharashtra',
            county: 'Ahmadpur',
            type: 'city'
          },
          geometry: { coordinates: [76.7740273, 18.6870656] }
        }]
      }
    };
  };

  try {
    const location = await resolveAhmedpurVillage('Dhanori (Bk)');
    assert.equal(location.longitude, 76.7740273);
    assert.equal(location.latitude, 18.6870656);
    assert.match(location.name, /Dhanori \(Bk\)/);
  } finally {
    axios.get = originalGet;
  }
});
