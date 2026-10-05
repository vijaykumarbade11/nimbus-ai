const express = require('express');
const axios = require('axios');
const { body, validationResult } = require('express-validator');
const { getCurrentWeather, resolveAhmedpurVillage } = require('../services/weatherService');
const { getSoilData } = require('../services/soilService');

const router = express.Router();
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const responseLanguages = { mr: 'Marathi', hi: 'Hindi', en: 'English' };
const getResponseLanguage = (language) => Object.prototype.hasOwnProperty.call(responseLanguages, language)
  ? responseLanguages[language]
  : responseLanguages.mr;

const callOpenAI = async (messages) => {
  if (!process.env.OPENAI_API_KEY) {
    const error = new Error('Verified crop advice is unavailable because the AI provider is not configured.');
    error.status = 503;
    throw error;
  }

  const response = await axios.post(OPENAI_URL, {
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: 0.1,
    response_format: { type: 'json_object' },
    messages
  }, {
    timeout: 35000,
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });

  const content = response.data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('The advisory provider returned no response.');
  const result = JSON.parse(content);
  if (!result || typeof result !== 'object' || Array.isArray(result)) {
    throw new Error('The advisory provider returned an invalid response.');
  }
  return result;
};

const fieldValidation = [
  body('crop').isString().trim().notEmpty().isLength({ max: 80 }),
  body('variety').isString().trim().notEmpty().isLength({ max: 100 }),
  body('sowingDate').isISO8601().toDate(),
  body('soilType').isString().trim().notEmpty().isLength({ max: 100 }),
  body('irrigationType').isString().trim().notEmpty().isLength({ max: 100 }),
  body('stage').isString().trim().notEmpty().isLength({ max: 100 }),
  body('symptoms').isString().trim().notEmpty().isLength({ max: 1200 }),
  body('village').isString().trim().notEmpty().isLength({ max: 100 }),
  body('soilTestDate').isISO8601().toDate().custom((date) => date <= new Date()),
  body('soilPH').isFloat({ min: 0, max: 14 }),
  body('availableNitrogen').isFloat({ min: 0, max: 100000 }),
  body('availablePhosphorus').isFloat({ min: 0, max: 100000 }),
  body('availablePotassium').isFloat({ min: 0, max: 100000 })
];

router.post('/', fieldValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: 'Complete all field details before requesting advice.', errors: errors.array() });
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ message: 'Evidence-based advice is unavailable because the AI provider is not configured. No advice was generated.' });
  }

  try {
    const location = await resolveAhmedpurVillage(req.body.village);
    const [weather, soil] = await Promise.all([
      getCurrentWeather(location),
      getSoilData(location)
    ]);
    if (weather.error || weather.current?.temp == null) {
      return res.status(503).json({ message: 'Current weather data is unavailable for this village. Advice was not generated.' });
    }
    if (!soil.properties || !['clay', 'sand', 'silt', 'organicCarbon'].some((key) => soil.properties[key] != null)) {
      return res.status(503).json({ message: 'Soil data is unavailable for this village. Advice was not generated.' });
    }

    const fieldEvidence = {
      farmerReportedField: {
        crop: req.body.crop.trim(),
        variety: req.body.variety.trim(),
        sowingDate: req.body.sowingDate,
        fieldSoilTest: {
          date: req.body.soilTestDate,
          pH: Number(req.body.soilPH),
          availableNitrogenKgPerHectare: Number(req.body.availableNitrogen),
          availablePhosphorusKgPerHectare: Number(req.body.availablePhosphorus),
          availablePotassiumKgPerHectare: Number(req.body.availablePotassium)
        },
        cropStage: req.body.stage.trim(),
        farmerReportedSoilType: req.body.soilType.trim(),
        irrigationType: req.body.irrigationType.trim(),
        symptoms: req.body.symptoms.trim(),
        village: location.name
      },
      currentWeather: {
        source: weather.source,
        current: weather.current,
        forecast: weather.forecast
      },
      modelledSoilEstimate: {
        source: soil.source,
        depth: soil.depth,
        properties: soil.properties,
        limitation: soil.limitation
      }
    };
    const advice = await callOpenAI([
      {
        role: 'system',
        content: `You are a cautious agricultural information assistant for Maharashtra. Reply entirely in ${getResponseLanguage(req.body.lang)} using farmer-friendly terminology. Keep crop/variety names and units recognizable. Use only the farmer-provided facts and supplied weather/soil evidence. Treat field soil-test measurements as the primary nutrient evidence; consider the test date and request a new test if it may be stale. A soil map estimate is not a field test. Do not claim the crop is healthy, diagnose a disease, invent local research recommendations, invent pesticide/fertiliser doses, or recommend chemical treatment. If evidence is insufficient, say so and request the specific test or expert inspection needed. Do not give a guaranteed or “perfect” forecast. Return valid JSON with exactly: summary (string), evidenceUsed (array of strings), immediateActions (array of strings), irrigation (string), nutrition (string), pestAndDiseaseChecks (array of strings), weatherTiming (string), whatToConfirm (array of strings), safetyWarning (string).`
      },
      { role: 'user', content: JSON.stringify(fieldEvidence) }
    ]);

    return res.json({
      source: 'OPENAI_WITH_LIVE_WEATHER_AND_SOILGRIDS_ESTIMATE',
      location: location.name,
      evidence: {
        weatherSource: weather.source,
        weatherTime: weather.current.updatedAt || null,
        soilSource: soil.source,
        soilDepth: soil.depth,
        soilLimitation: soil.limitation
      },
      advice
    });
  } catch (error) {
    console.error('Evidence-based crop advisory failed:', error.message);
    return res.status(error.status || (error.code === 'LOCATION_NOT_FOUND' ? 422 : 503)).json({
      message: error.status ? error.message : 'Advice could not be verified with current weather, soil, and AI services. No advice was generated.'
    });
  }
});

router.post('/disease-detection', async (req, res) => {
  const {
    crop, variety, sowingDate, stage, village, symptoms, soilType, irrigationType,
    soilTestDate, soilPH, availableNitrogen, availablePhosphorus, availablePotassium, imageData, lang
  } = req.body || {};
  if (![crop, variety, sowingDate, stage, village, symptoms, soilType, irrigationType, soilTestDate, imageData]
    .every((value) => typeof value === 'string' && value.trim())
    || Number.isNaN(Date.parse(soilTestDate)) || new Date(soilTestDate) > new Date()
    || ![soilPH, availableNitrogen, availablePhosphorus, availablePotassium]
      .every((value) => typeof value === 'string' && value.trim() && Number.isFinite(Number(value)))
    || !Number.isFinite(Number(soilPH)) || Number(soilPH) < 0 || Number(soilPH) > 14
    || ![availableNitrogen, availablePhosphorus, availablePotassium]
      .every((value) => Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 100000)) {
    return res.status(400).json({ message: 'Complete the field plan and soil laboratory measurements before requesting photo review.' });
  }

  const imageMatch = imageData.match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/);
  if (!imageMatch || imageMatch[2].length > 1600000) {
    return res.status(400).json({ message: 'Use a JPG, PNG, or WebP image smaller than 1.2 MB.' });
  }
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ message: 'Photo assessment is unavailable because the AI vision provider is not configured. No diagnosis was generated.' });
  }

  try {
    const location = await resolveAhmedpurVillage(village);
    const [weather, soil] = await Promise.all([
      getCurrentWeather(location),
      getSoilData(location)
    ]);
    if (weather.error || weather.current?.temp == null || !soil.properties) {
      return res.status(503).json({ message: 'Weather or soil evidence is unavailable for this village. No photo assessment was generated.' });
    }

    const result = await callOpenAI([
      {
        role: 'system',
        content: `You are a cautious plant-health triage assistant. Reply entirely in ${getResponseLanguage(lang)} using farmer-friendly terminology. Inspect the supplied image for whether it shows a plant, crop, leaf, flower, or fruit and describe only visible features. Use the farmer field details, actual lab values, supplied weather, and modelled regional soil estimate as context, but do not claim they prove a cause. A photo cannot confirm a disease or distinguish all causes. Never invent a diagnosis, pesticide, dose, or certainty. If the image is unclear, say so. Recommend field inspection or a plant clinic when needed. Return JSON with exactly: imageAssessment, visibleSymptoms, possibleCauses (array, explicitly tentative), imageLimitations, recommendedNextSteps (array), expertReviewNeeded (boolean), safetyWarning.`
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              field: {
                crop, variety, sowingDate, stage, village, farmerReportedSymptoms: symptoms,
                soilType, irrigationType,
                soilTest: {
                  date: soilTestDate,
                  pH: Number(soilPH),
                  availableNitrogenKgPerHectare: Number(availableNitrogen),
                  availablePhosphorusKgPerHectare: Number(availablePhosphorus),
                  availablePotassiumKgPerHectare: Number(availablePotassium)
                }
              },
              weather: { source: weather.source, current: weather.current, forecast: weather.forecast },
              regionalSoilEstimate: { source: soil.source, depth: soil.depth, properties: soil.properties, limitation: soil.limitation }
            })
          },
          { type: 'image_url', image_url: { url: imageData, detail: 'high' } }
        ]
      }
    ]);
    return res.json({ source: 'OPENAI_VISION_TRIAGE', assessment: result });
  } catch (error) {
    console.error('Crop image assessment failed:', error.message);
    return res.status(error.status || 503).json({
      message: error.status ? error.message : 'Image review is unavailable. No diagnosis was generated.'
    });
  }
});

module.exports = router;
