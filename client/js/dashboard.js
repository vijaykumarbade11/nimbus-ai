document.addEventListener('DOMContentLoaded', async () => {
  const farmer = window.NimbusLocation?.getFarmer?.() || {};

  let freshLocation = null;
  try {
    freshLocation = await Promise.race([
      window.NimbusLocation?.capture?.() || Promise.resolve(null),
      new Promise((resolve) => window.setTimeout(() => resolve(null), 5000))
    ]);
  } catch (error) {
    console.warn('Unable to capture current device location for dashboard:', error.message);
  }
  const storedDeviceLocation = window.NimbusLocation?.get?.();
  const storedLocationAge = Date.now() - Date.parse(storedDeviceLocation?.capturedAt || '');
  const recentDeviceLocation = storedDeviceLocation
    && Number.isFinite(storedDeviceLocation.latitude)
    && Number.isFinite(storedDeviceLocation.longitude)
    && Number.isFinite(storedLocationAge)
    && storedLocationAge >= 0
    && storedLocationAge < 24 * 60 * 60 * 1000
    ? storedDeviceLocation
    : null;
  const activeDeviceLocation = freshLocation || recentDeviceLocation;
  const weatherParams = new URLSearchParams();
  if (activeDeviceLocation) {
    weatherParams.set('lat', activeDeviceLocation.latitude);
    weatherParams.set('lon', activeDeviceLocation.longitude);
  } else {
    if (farmer.village) {
      weatherParams.set('village', farmer.village);
    }
  }
  const query = weatherParams.toString();
  const locationPath = `/api/weather/current${query ? `?${query}` : ''}`;
  const soilPath = locationPath.replace('/api/weather/current', '/api/soil/current');
  const weatherCard = document.querySelector('.weather-card');
  const locationEl = document.getElementById('dashboardLocation');
  const visitorLocation = activeDeviceLocation;
  let lastWeatherUpdate = 0;

  try {
    const response = await window.NimbusApi.request(locationPath);
    const weather = await response.json();
    if (!response.ok || !weather || weather.error) {
      throw new Error(weather?.error || weather?.message || 'Weather data is temporarily unavailable.');
    }

    const current = weather.current || weather;
    if (current.temp == null) throw new Error('The weather source returned no current temperature.');

    if (locationEl) {
      const locationName = weather.location?.name || farmer.village || 'Ahmedpur';
      const profileLocation = `${farmer.village || 'Ahmedpur'}, ${farmer.district || 'Latur'}, ${farmer.state || 'Maharashtra'}`;
      const displayedLocation = visitorLocation ? locationName : profileLocation;
      const pin = document.createElement('i');
      pin.className = 'fa-solid fa-location-dot';
      pin.setAttribute('aria-hidden', 'true');
      locationEl.replaceChildren(pin, document.createTextNode(
        ` ${displayedLocation}${visitorLocation ? ' · Personalized for this device' : ''}`
      ));
    }

    if (weatherCard) {
      weatherCard.innerHTML = `
        <div class="card-header">
          <h3>Weather</h3>
          <span class="badge warning"></span>
        </div>
        <div class="weather-large">
          <div><h2></h2><p></p></div>
          <i class="fa-solid big-icon" aria-hidden="true"></i>
        </div>
        <div class="metrics-grid">
          <div><span>Humidity</span><strong></strong></div>
          <div><span>Rain Prob.</span><strong></strong></div>
          <div><span>Wind</span><strong></strong></div>
          <div><span>Rainfall</span><strong></strong></div>
        </div>
        <p class="alert-message"></p>
      `;
      const metricValues = [
        current.humidity == null ? '--' : `${current.humidity}%`,
        current.rainProbability == null ? '--' : `${current.rainProbability}%`,
        current.wind == null ? '--' : `${current.wind} km/h`,
        current.rainfall == null ? '--' : `${current.rainfall} mm`
      ];
      weatherCard.querySelector('.badge').textContent = current.alert || weather.source || 'Weather update';
      weatherCard.querySelector('.weather-large h2').textContent = `${current.temp}°C`;
      weatherCard.querySelector('.weather-large p').textContent = current.condition || 'Weather update';
      weatherCard.querySelector('.big-icon').classList.add(current.temp > 32 ? 'fa-sun' : 'fa-cloud-rain');
      weatherCard.querySelectorAll('.metrics-grid strong').forEach((element, index) => {
        element.textContent = metricValues[index];
      });
      weatherCard.querySelector('.alert-message').textContent = current.alertMessage
        || `Weather forecast from ${weather.source || 'the configured provider'}. Forecast values are estimates, not local station observations.`;
    }
    lastWeatherUpdate = Date.now();
  } catch (error) {
    console.warn('Unable to load weather data for dashboard:', error);
    if (weatherCard) {
      weatherCard.innerHTML = `
        <div class="card-header"><h3>Weather</h3><span class="badge warning">Unavailable</span></div>
        <div class="weather-large"><div><h2>--</h2><p>Weather feed unavailable</p></div><i class="fa-solid fa-cloud-rain big-icon" aria-hidden="true"></i></div>
        <div class="metrics-grid">
          <div><span>Humidity</span><strong>--</strong></div>
          <div><span>Rain Prob.</span><strong>--</strong></div>
          <div><span>Wind</span><strong>--</strong></div>
          <div><span>Rainfall</span><strong>--</strong></div>
        </div>
        <p class="alert-message"></p>
        <a class="btn btn-light" href="weather.html">Open Weather Forecast and choose a location</a>
      `;
      weatherCard.querySelector('.alert-message').textContent = error.message || 'Weather data could not be loaded.';
    }
  }

  const refreshDashboardWeather = async () => {
    if (document.hidden || !weatherCard) return;
    try {
      const response = await window.NimbusApi.request(locationPath);
      const weather = await response.json();
      if (!response.ok || weather.error || weather.current?.temp == null) {
        throw new Error(weather.message || weather.error || 'Weather update is temporarily unavailable.');
      }
      const current = weather.current;
      weatherCard.querySelector('.badge').textContent = current.alert || weather.source || 'Weather update';
      weatherCard.querySelector('.weather-large h2').textContent = `${current.temp}°C`;
      weatherCard.querySelector('.weather-large p').textContent = current.condition || 'Weather update';
      weatherCard.querySelector('.big-icon').className = `fa-solid big-icon ${current.temp > 32 ? 'fa-sun' : 'fa-cloud-rain'}`;
      const metricValues = [
        current.humidity == null ? '--' : `${current.humidity}%`,
        current.rainProbability == null ? '--' : `${current.rainProbability}%`,
        current.wind == null ? '--' : `${current.wind} km/h`,
        current.rainfall == null ? '--' : `${current.rainfall} mm`
      ];
      weatherCard.querySelectorAll('.metrics-grid strong').forEach((element, index) => {
        element.textContent = metricValues[index];
      });
      weatherCard.querySelector('.alert-message').textContent = current.alertMessage
        || `Weather forecast from ${weather.source || 'the configured provider'}. Forecast values are estimates, not local station observations.`;
      lastWeatherUpdate = Date.now();
    } catch (error) {
      console.warn('Dashboard weather refresh failed:', error);
      const message = weatherCard.querySelector('.alert-message');
      if (message) message.textContent = `Weather refresh failed: ${error.message}`;
    }
  };
  window.setInterval(refreshDashboardWeather, 15 * 60 * 1000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && Date.now() - lastWeatherUpdate >= 15 * 60 * 1000) {
      refreshDashboardWeather();
    }
  });

  try {
    const soilResponse = await window.NimbusApi.request(soilPath);
    const soil = await soilResponse.json();
    if (!soilResponse.ok || !soil.properties) {
      throw new Error(soil.error || soil.message || 'Public soil estimate is unavailable.');
    }

    const soilSource = document.getElementById('soilSource');
    const soilSummary = document.getElementById('soilSummary');
    if (soilSource) soilSource.textContent = 'SoilGrids public estimate';
    if (soilSummary) {
      soilSummary.innerHTML = `
        <p><strong></strong> · ${soil.depth || '0-5 cm'}</p>
        <div class="soil-metrics">
          <span>Clay <strong></strong></span>
          <span>Sand <strong></strong></span>
          <span>Silt <strong></strong></span>
          <span>Organic carbon <strong></strong></span>
        </div>
        <p class="soil-note"></p>
        <small></small>
      `;
      soilSummary.querySelector('p strong').textContent = soil.location?.name || 'Active location';
      soilSummary.querySelectorAll('.soil-metrics span strong').forEach((element, index) => {
        const values = [
          soil.properties.clay == null ? '--%' : `${soil.properties.clay}%`,
          soil.properties.sand == null ? '--%' : `${soil.properties.sand}%`,
          soil.properties.silt == null ? '--%' : `${soil.properties.silt}%`,
          soil.properties.organicCarbon == null ? '-- g/kg' : `${soil.properties.organicCarbon} g/kg`
        ];
        element.textContent = values[index];
      });
      soilSummary.querySelector('.soil-note').textContent = soil.interpretation || 'This is a regional model estimate, not a field laboratory result.';
      soilSummary.querySelector('small').textContent = soil.limitation || '';
    }
  } catch (error) {
    console.warn('Unable to load soil estimate for dashboard:', error);
    const soilSource = document.getElementById('soilSource');
    const soilSummary = document.getElementById('soilSummary');
    if (soilSource) soilSource.textContent = 'Unavailable';
    if (soilSummary) soilSummary.textContent = error.message || 'Public soil data is temporarily unavailable.';
  }

  window.setTimeout(() => window.NimbusTranslate?.(), 0);
});
