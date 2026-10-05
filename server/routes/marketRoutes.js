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

router.get('/', async (req, res) => {
  const crop = String(req.query.crop || 'soybean').toLowerCase();
  const url = cropPages[crop];
  if (!url) return res.status(400).json({ message: 'Market rates are not configured for this crop.' });

  const cached = cache.get(crop);
  if (cached && Date.now() - cached.time < 10 * 60 * 1000) return res.json(cached.data);

  try {
    const response = await axios.get(url, {
      timeout: 20000,
      headers: { Accept: 'text/html', 'User-Agent': 'Nimbus-AI/1.0' }
    });
    const parsed = parseRows(response.data);
    const ahmedpurListed = parsed.rows.some((row) => /ahmedpur|ahmadpur|अहमदपूर|अहमदपुर/i.test(row.market));
    const data = {
      sourceName,
      sourceUrl: url,
      updatedAt: parsed.updatedAt,
      ahmedpurListed,
      rows: parsed.rows
    };
    cache.set(crop, { time: Date.now(), data });
    return res.json(data);
  } catch (error) {
    return res.status(503).json({ message: 'Public market rates are temporarily unavailable.', sourceName, sourceUrl: url });
  }
});

module.exports = router;
