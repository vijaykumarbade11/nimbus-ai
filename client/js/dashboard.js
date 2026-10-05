document.addEventListener('DOMContentLoaded', async () => {
  const locationPath = window.NimbusLocation?.buildWeatherUrl?.('/api/weather/current') || '/api/weather/current';
  const soilPath = locationPath.replace('/api/weather/current', '/api/soil/current');

  try {
    const weatherPath = locationPath;
    const response = await fetch(window.NimbusApi?.url?.(weatherPath) || weatherPath);
    const weather = await response.json();

    if (!response.ok || !weather || weather.error) {
      throw new Error(weather?.error || 'Official weather data unavailable.');
    }

    const current = weather.current || weather;
    const farmer = window.NimbusLocation?.getFarmer?.() || {};
    const visitorLocation = window.NimbusLocation?.get?.();
    const locationEl = document.getElementById('dashboardLocation');
    if (locationEl) {
      const locationName = weather.location?.name || farmer.village || 'Ahmedpur';
      const profileLocation = `${farmer.village || 'Ahmedpur'}, ${farmer.district || 'Latur'}, ${farmer.state || 'Maharashtra'}`;
      const displayedLocation = visitorLocation ? locationName : profileLocation;
      const personalizationNote = visitorLocation ? ' · Personalized for this device' : '';
      locationEl.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${displayedLocation}${personalizationNote}`;
    }
    const weatherCard = document.querySelector('.weather-card');

    if (weatherCard) {
      const title = current.alert && current.alert !== 'Weather alert' ? current.alert : 'Weather update';
      weatherCard.innerHTML = `
        <div class="card-header">
          <h3>Weather</h3>
          <span class="badge warning">${title}</span>
        </div>
        <div class="weather-large">
          <div>
            <h2>${current.temp == null ? '--' : `${current.temp}°C`}</h2>
            <p>${current.condition || 'Official weather data'}</p>
          </div>
          <i class="fa-solid ${current.temp > 32 ? 'fa-sun' : 'fa-cloud-rain'} big-icon"></i>
        </div>
        <div class="metrics-grid">
          <div><span>Humidity</span><strong>${current.humidity == null ? '--' : `${current.humidity}%`}</strong></div>
          <div><span>Rain Prob.</span><strong>${current.rainProbability == null ? '--' : `${current.rainProbability}%`}</strong></div>
          <div><span>Wind</span><strong>${current.wind == null ? '--' : `${current.wind} km/h`}</strong></div>
          <div><span>Rainfall</span><strong>${current.rainfall == null ? '--' : `${current.rainfall} mm`}</strong></div>
        </div>
        <p class="alert-message">${current.alertMessage || 'Official weather data is being refreshed from IMD and agromet sources.'}</p>
      `;
    }

    const soilResponse = await fetch(window.NimbusApi?.url?.(soilPath) || soilPath);
    const soil = await soilResponse.json();
    const soilSource = document.getElementById('soilSource');
    const soilSummary = document.getElementById('soilSummary');
    if (soilResponse.ok && soil.properties && soilSummary) {
      if (soilSource) soilSource.textContent = 'SoilGrids public estimate';
      soilSummary.innerHTML = `
        <p><strong>${soil.location?.name || weather.location?.name || 'Active location'}</strong> · ${soil.depth || '0-5 cm'}</p>
        <div class="soil-metrics">
          <span>Clay <strong>${soil.properties.clay ?? '--'}%</strong></span>
          <span>Sand <strong>${soil.properties.sand ?? '--'}%</strong></span>
          <span>Silt <strong>${soil.properties.silt ?? '--'}%</strong></span>
          <span>Organic carbon <strong>${soil.properties.organicCarbon ?? '--'} g/kg</strong></span>
        </div>
        <p class="soil-note">${soil.interpretation}</p>
        <small>${soil.limitation}</small>
      `;
    }
    window.setTimeout(() => window.NimbusTranslate?.(), 0);
  } catch (error) {
    console.warn('Unable to load weather data', error);
    const weatherCard = document.querySelector('.weather-card');
    if (weatherCard) {
      weatherCard.innerHTML = `
        <div class="card-header">
          <h3>Weather</h3>
          <span class="badge warning">Unavailable</span>
        </div>
        <div class="weather-large">
          <div>
            <h2>--</h2>
            <p>Official feed unavailable</p>
          </div>
          <i class="fa-solid fa-cloud-rain big-icon"></i>
        </div>
        <div class="metrics-grid">
          <div><span>Humidity</span><strong>--</strong></div>
          <div><span>Rain Prob.</span><strong>--</strong></div>
          <div><span>Wind</span><strong>--</strong></div>
          <div><span>Rainfall</span><strong>--</strong></div>
        </div>
        <p class="alert-message">Weather data is temporarily unavailable. Try again later or select a location on the Weather page.</p>
      `;
    }
    const soilSummary = document.getElementById('soilSummary');
    if (soilSummary) soilSummary.innerHTML = '<p class="warning-note">Public soil data is temporarily unavailable. Use a local soil test for field decisions.</p>';
    window.setTimeout(() => window.NimbusTranslate?.(), 0);
  }
});
