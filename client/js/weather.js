document.addEventListener('DOMContentLoaded', async () => {
  const t = (text, values) => window.NimbusI18n?.t?.(text, values) || text;
  const locale = () => window.NimbusI18n?.locale?.() || 'en-IN';
  const sourceEl = document.getElementById('weatherSource');
  const villageSelect = document.getElementById('weatherVillage');
  const checkVillageButton = document.getElementById('checkVillageWeather');
  const currentLocationButton = document.getElementById('useCurrentWeatherLocation');
  const farmer = window.NimbusLocation?.getFarmer?.() || {};
  let deviceLocation = null;
  let locationFallbackMessage = '';
  let villageSelectedByUser = false;
  let requestId = 0;
  let selectedVillagePending = false;

  if (villageSelect) {
    const villages = window.AhmedpurVillages || ['Ahmedpur'];
    villageSelect.replaceChildren(...villages.map((village) => new Option(village, village)));
    villageSelect.value = villages.includes(farmer.village) ? farmer.village : 'Ahmedpur';
  }

  if (!currentLocationButton && !villageSelect) return;

  const setStatus = (message) => {
    if (sourceEl) sourceEl.textContent = message;
  };

  const clearWeather = () => {
    document.querySelectorAll('.weather-row strong').forEach((element) => {
      element.textContent = '--';
    });
    const list = document.querySelector('.forecast-list');
    if (list) list.replaceChildren();
  };

  const renderUnavailable = (message) => {
    setStatus(t(message));
    clearWeather();
    const list = document.querySelector('.forecast-list');
    if (list) {
      const row = document.createElement('li');
      row.textContent = t('No forecast data is available for this location right now.');
      list.append(row);
    }
  };

  const loadWeather = async () => {
    const currentRequest = ++requestId;
    const button = deviceLocation ? currentLocationButton : checkVillageButton;
    if (button) button.disabled = true;
    const selectedLocation = deviceLocation ? 'your current location' : (villageSelect?.value || 'Ahmedpur');
    setStatus(deviceLocation
      ? t('Loading weather near your current location…')
      : t('Loading weather estimate for {location}…', { location: selectedLocation }));
    clearWeather();

    const params = new URLSearchParams();
    if (deviceLocation) {
      params.set('lat', deviceLocation.latitude);
      params.set('lon', deviceLocation.longitude);
    } else {
      params.set('village', villageSelect?.value || 'Ahmedpur');
    }

    try {
      const path = `/api/weather/current?${params}`;
      const response = await window.NimbusApi.request(path, { signal: AbortSignal.timeout(25000) });
      const data = await response.json();
      if (currentRequest !== requestId) return;
      if (!response.ok || data?.error) {
        throw new Error(data?.error || data?.message || t('Weather service returned {status}.', { status: response.status }));
      }

      const current = data.current || {};
      if (current.temp == null || !Array.isArray(data.forecast)) {
        throw new Error('The weather source returned incomplete current conditions or forecast data.');
      }
      const numberFormat = new Intl.NumberFormat(locale(), { maximumFractionDigits: 1 });
      const values = {
        temperature: current.temp == null ? '--' : `${numberFormat.format(current.temp)}°C`,
        feels: current.feelsLike == null ? '--' : `${numberFormat.format(current.feelsLike)}°C`,
        humidity: current.humidity == null ? '--' : `${numberFormat.format(current.humidity)}%`,
        wind: current.wind == null ? '--' : `${numberFormat.format(current.wind)} km/h`,
        rain: current.rainProbability == null ? '--' : `${numberFormat.format(current.rainProbability)}%`,
        rainfall: current.rainfall == null ? '--' : `${numberFormat.format(current.rainfall)} mm`
      };

      document.querySelectorAll('.weather-row').forEach((row) => {
        const value = values[row.dataset.weatherMetric] ?? '--';
        const strong = row.querySelector('strong');
        if (strong) strong.textContent = value;
      });

      const place = data.location?.name || t('Selected area');
      const accuracyValue = deviceLocation?.accuracy
        ? `${deviceLocation.accuracy >= 1000
          ? `${(deviceLocation.accuracy / 1000).toLocaleString(locale(), { maximumFractionDigits: 1 })} km`
          : `${deviceLocation.accuracy.toLocaleString(locale())} m`}`
        : '';
      const source = t(data.source === 'OPEN_METEO_PUBLIC'
        ? 'Open-Meteo forecast model'
        : data.source === 'OPENWEATHERMAP' ? 'OpenWeather model' : (data.source || 'Weather provider'));
      const time = current.updatedAt ? new Date(current.updatedAt).toLocaleString(locale()) : '';
      const statusKey = accuracyValue && time
        ? '{location} · GPS accuracy ±{accuracy} · {source} · Model time {time}. Area estimates can differ from field measurements.'
        : time
          ? '{location} · {source} · Model time {time}. Area estimates can differ from field measurements.'
          : accuracyValue
            ? '{location} · GPS accuracy ±{accuracy} · {source}. Area estimates can differ from field measurements.'
            : '{location} · {source}. Area estimates can differ from field measurements.';
      setStatus(`${locationFallbackMessage ? `${t(locationFallbackMessage)} · ` : ''}${t(statusKey, { location: place, accuracy: accuracyValue, source, time })}`);

      const list = document.querySelector('.forecast-list');
      const items = Array.isArray(data.forecast) ? data.forecast.slice(0, 5) : [];
      if (list) {
        if (!items.length) {
          const row = document.createElement('li');
          row.textContent = t('Forecast data is unavailable from the weather source.');
          list.append(row);
        } else {
          items.forEach((item) => {
            const row = document.createElement('li');
            const day = document.createElement('span');
            const forecastDate = item.date ? new Date(`${item.date}T12:00:00`) : null;
            day.textContent = forecastDate
              ? forecastDate.toLocaleDateString(locale(), { weekday: 'short', timeZone: 'Asia/Kolkata' })
              : t(item.day || 'Forecast');
            const temperature = document.createElement('strong');
            const temperatureFormat = new Intl.NumberFormat(locale(), { maximumFractionDigits: 1 });
            temperature.textContent = item.temp == null
              ? '--'
              : `${temperatureFormat.format(item.minTemp == null ? item.temp : item.minTemp)}–${temperatureFormat.format(item.temp)}°C`;
            const details = document.createElement('small');
            const detailsText = [t(item.condition || 'Forecast'), item.rainProbability == null ? null : t('Rain {probability}%', { probability: new Intl.NumberFormat(locale()).format(item.rainProbability) })]
              .filter(Boolean).join(' · ');
            details.textContent = detailsText || t('Forecast details unavailable');
            row.append(day, temperature, details);
            list.append(row);
          });
        }
      }
      window.setTimeout(() => window.NimbusTranslate?.(), 0);
    } catch (error) {
      if (currentRequest !== requestId) return;
      console.warn('Weather fetch failed', error);
      renderUnavailable(error.message || 'Weather data could not be loaded. Please try again.');
    } finally {
      if (button) button.disabled = false;
    }
  };

  villageSelect?.addEventListener('change', () => {
    villageSelectedByUser = true;
    deviceLocation = null;
    locationFallbackMessage = '';
    selectedVillagePending = true;
    setStatus(t('Village selected. Press Check weather to load its forecast.', { location: villageSelect.value }));
  });

  checkVillageButton?.addEventListener('click', () => {
    if (!villageSelect?.value) {
      renderUnavailable('Choose an Ahmedpur taluka village first.');
      return;
    }
    deviceLocation = null;
    selectedVillagePending = false;
    locationFallbackMessage = '';
    loadWeather();
  });

  const requestCurrentLocation = async (automatic = false) => {
    if (currentLocationButton) currentLocationButton.disabled = true;
    setStatus(t('Requesting precise device location…'));
    try {
      const location = await window.NimbusLocation?.capture?.();
      if (!location) throw new Error('Location permission was denied or GPS is unavailable. Choose your village or allow location access in browser settings.');
      if (automatic && villageSelectedByUser) return;
      deviceLocation = location;
      selectedVillagePending = false;
      locationFallbackMessage = '';
      await loadWeather();
    } catch (error) {
      if (automatic && villageSelectedByUser) return;
      deviceLocation = null;
      locationFallbackMessage = error.message || 'Could not determine your current location.';
      if (!selectedVillagePending) await loadWeather();
      else setStatus(t('Village selected. Press Check weather to load its forecast.', { location: villageSelect?.value || 'Ahmedpur' }));
    } finally {
      if (currentLocationButton) currentLocationButton.disabled = false;
    }
  };

  currentLocationButton?.addEventListener('click', () => {
    villageSelectedByUser = false;
    requestCurrentLocation();
  });
  document.addEventListener('nimbus-language-changed', loadWeather);
  window.setInterval(() => {
    if (!document.hidden && !selectedVillagePending) loadWeather();
  }, 15 * 60 * 1000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !selectedVillagePending) loadWeather();
  });
  await requestCurrentLocation(true);
});
