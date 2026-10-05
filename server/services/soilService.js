const axios = require('axios');

const DEFAULT_SOIL_LOCATION = {
  name: 'Ahmedpur, Latur, Maharashtra',
  latitude: 18.7058,
  longitude: 76.9367
};

const SOILGRIDS_URL = 'https://rest.isric.org/soilgrids/v2.0/properties/query';

const toPercent = (layer) => {
  const value = layer?.depths?.[0]?.values?.mean;
  return Number.isFinite(Number(value)) ? Number((Number(value) / 10).toFixed(1)) : null;
};

async function getSoilData(location = DEFAULT_SOIL_LOCATION) {
  const properties = ['clay', 'sand', 'silt', 'soc'];
  const responses = await Promise.allSettled(properties.map((property) => axios.get(SOILGRIDS_URL, {
    params: {
      lon: location.longitude,
      lat: location.latitude,
      property,
      depth: '0-5cm',
      value: 'mean'
    },
    timeout: 12000,
    headers: { Accept: 'application/json', 'User-Agent': 'Nimbus-AI/1.0' }
  })));

  const layers = responses
    .filter((result) => result.status === 'fulfilled')
    .flatMap((result) => result.value.data?.properties?.layers || []);
  const byName = Object.fromEntries(layers.map((layer) => [layer.name, layer]));
  const clay = toPercent(byName.clay);
  const sand = toPercent(byName.sand);
  const silt = toPercent(byName.silt);
  const organicCarbon = toPercent(byName.soc);

  if (![clay, sand, silt, organicCarbon].some((value) => value != null)) {
    throw new Error('SoilGrids returned no soil measurements.');
  }

  return {
    source: 'ISRIC_SOILGRIDS_PUBLIC',
    depth: '0-5 cm',
    location,
    properties: { clay, sand, silt, organicCarbon },
    interpretation: clay != null && clay >= 35
      ? 'Clay-rich surface soil. Avoid working it when wet, maintain drainage, and use soil-test-based fertiliser decisions.'
      : 'Surface texture is not strongly clay-rich at this point. Confirm field texture and nutrients with a local soil test before major input decisions.',
    limitation: 'SoilGrids is a regional modelled estimate, not a substitute for a laboratory soil test from the farmer field.'
  };
}

module.exports = { DEFAULT_SOIL_LOCATION, getSoilData };
