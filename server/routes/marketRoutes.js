const express = require('express');
const axios = require('axios');

const router = express.Router();
const cache = new Map();
const sourceName = 'Krushi Kranti public mandi reference';
const cropPages = {
  soybean: 'https://www.krushikranti.com/bajarbhav/soybean-bajar-bhav-today',
  cotton: 'https://www.krushikranti.com/bajarbhav/cotton-bajar-bhav-today',
  tur: 'https://www.krushikranti.com/bajarbhav/tur-bajar-bhav-today',
  maize: 'https://www.krushikranti.com/bajarbhav/maize-bajar-bhav-today',
  jowar: 'https://www.krushikranti.com/bajarbhav/jowar-bajar-bhav-today'
};
const cropNames = {
  soybean: 'Soybean',
  cotton: 'Cotton',
  tur: 'Tur / Pigeon Pea',
  maize: 'Maize',
  jowar: 'Jowar'
};

const clean = (value) => String(value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const decode = (value) => clean(value).replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');

function parseRows(html) {
  const rows = [];
  const rowMatches = html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);
  let updatedAt = null;

  for (const rowMatch of rowMatches) {
    const content = rowMatch[1];
    const dateMatch = content.match(/(\d{2}\/\d{2}\/\d{4})/);
    if (dateMatch && !content.match(/<td[^>]*>[^<]+<\/td>/i)) {
      updatedAt = dateMatch[1];
      continue;
    }

    const cells = [...content.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((match) => decode(match[1]));
    if (cells.length < 7 || cells[0].includes('बाजार समिती')) continue;
    rows.push({
      market: cells[0],
      variety: cells[1],
      unit: cells[2],
      arrivals: cells[3],
      minimum: cells[4],
      maximum: cells[5],
      modal: cells[6]
    });
  }

  return { rows: rows.slice(0, 100), updatedAt };
}

async function fetchCropRates(crop) {
  const url = cropPages[crop];
  const cached = cache.get(crop);
  if (cached && Date.now() - cached.time < 10 * 60 * 1000) return cached.data;

  const response = await axios.get(url, {
    timeout: 20000,
    headers: { Accept: 'text/html', 'User-Agent': 'Nimbus-AI/1.0' }
  });
  const parsed = parseRows(response.data);
  const data = {
    crop,
    cropName: cropNames[crop],
    sourceName,
    sourceUrl: url,
    updatedAt: parsed.updatedAt,
    ahmedpurListed: parsed.rows.some((row) => /ahmedpur|ahmadpur|अहमदपूर|अहमदपुर/i.test(row.market)),
    rows: parsed.rows.map((row) => ({ ...row, cropName: cropNames[crop] }))
  };
  cache.set(crop, { time: Date.now(), data });
  return data;
}

router.get('/', async (req, res) => {
  const crop = String(req.query.crop || 'soybean').toLowerCase();
  if (crop !== 'all' && !cropPages[crop]) {
    return res.status(400).json({ message: 'Market rates are not configured for this crop.' });
  }

  if (crop !== 'all') {
    try {
      return res.json(await fetchCropRates(crop));
    } catch (error) {
      return res.status(503).json({
        message: 'Public market rates are temporarily unavailable.',
        sourceName,
        sourceUrl: cropPages[crop]
      });
    }
  }

  const results = await Promise.allSettled(Object.keys(cropPages).map(fetchCropRates));
  const reports = results.map((result, index) => result.status === 'fulfilled'
    ? result.value
    : {
      crop: Object.keys(cropPages)[index],
      cropName: cropNames[Object.keys(cropPages)[index]],
      sourceName,
      sourceUrl: cropPages[Object.keys(cropPages)[index]],
      error: 'This crop report could not be loaded.',
      rows: []
    });
  const rows = reports.flatMap((report) => report.rows);
  if (!rows.length) {
    return res.status(503).json({
      message: 'Public market rates are temporarily unavailable.',
      sourceName,
      reports: reports.map(({ cropName, sourceUrl, error }) => ({ cropName, sourceUrl, error })),
      rows: []
    });
  }

  return res.json({
    sourceName,
    sourceUrl: null,
    updatedAt: null,
    ahmedpurListed: reports.some((report) => report.ahmedpurListed),
    reports: reports.map(({ cropName, sourceUrl, updatedAt, error, rows: reportRows }) => ({
      cropName,
      sourceUrl,
      updatedAt,
      error,
      hasRates: reportRows.length > 0
    })),
    rows
  });
});

module.exports = router;
