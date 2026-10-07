const express = require('express');
const axios = require('axios');
const { body, validationResult } = require('express-validator');
const { getCurrentWeather, resolveLocationName, resolveAhmedpurVillage, DEFAULT_LOCATION } = require('../services/weatherService');
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
  body('village').optional({ checkFalsy: true }).isString().trim().isLength({ max: 100 }),
  body('latitude').optional({ checkFalsy: true }).isFloat({ min: -90, max: 90 }),
  body('longitude').optional({ checkFalsy: true }).isFloat({ min: -180, max: 180 })
];

const resolveFieldLocation = async (details) => {
  if (details.latitude !== undefined && details.longitude !== undefined
    && details.latitude !== '' && details.longitude !== '') {
    return resolveLocationName({
      ...DEFAULT_LOCATION,
      latitude: Number(details.latitude),
      longitude: Number(details.longitude),
      name: 'Visitor location'
    });
  }
  return resolveAhmedpurVillage(details.village);
};

router.post('/', fieldValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: 'Complete all field details before requesting advice.', errors: errors.array() });
  const hasLatitude = req.body.latitude !== undefined && req.body.latitude !== '';
  const hasLongitude = req.body.longitude !== undefined && req.body.longitude !== '';
  if (hasLatitude !== hasLongitude || (!hasLatitude && !String(req.body.village || '').trim())) {
    return res.status(400).json({ message: 'Allow device location or choose a village before requesting advice.' });
  }
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ message: 'Evidence-based advice is unavailable because the AI provider is not configured. No advice was generated.' });
  }

  try {
    const location = await resolveFieldLocation(req.body);
    const [weather, soil] = await Promise.all([
      getCurrentWeather(location),
      getSoilData(location)
    ]);
    if (weather.error || weather.current?.temp == null) {
      return res.status(503).json({ message: 'Current weather data is unavailable for this location. Advice was not generated.' });
    }
    if (!soil.properties || !['clay', 'sand', 'silt', 'organicCarbon'].some((key) => soil.properties[key] != null)) {
      return res.status(503).json({ message: 'Soil data is unavailable for this location. Advice was not generated.' });
    }

    const fieldEvidence = {
      farmerReportedField: {
        crop: req.body.crop.trim(),
        variety: req.body.variety.trim(),
        sowingDate: req.body.sowingDate,
        cropStage: req.body.stage.trim(),
        farmerReportedSoilType: req.body.soilType.trim(),
        irrigationType: req.body.irrigationType.trim(),
        symptoms: req.body.symptoms.trim(),
        location: location.name
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
        content: `You are a cautious agricultural information assistant for Maharashtra. Reply entirely in ${getResponseLanguage(req.body.lang)} using farmer-friendly terminology. Keep crop/variety names and units recognizable. Use only the farmer-provided facts and supplied weather/soil evidence. The soil data is a regional model estimate, not a field laboratory result; never treat it as measured field nutrients or infer exact fertiliser requirements from it. Do not claim the crop is healthy, diagnose a disease, invent local research recommendations, invent pesticide/fertiliser doses, or recommend chemical treatment. If evidence is insufficient, say so and request the specific test or expert inspection needed. Do not give a guaranteed or “perfect” forecast. Return valid JSON with exactly: summary (string), evidenceUsed (array of strings), immediateActions (array of strings), irrigation (string), nutrition (string), pestAndDiseaseChecks (array of strings), weatherTiming (string), whatToConfirm (array of strings), safetyWarning (string).`
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

router.post('/chat', async (req, res) => {
  const { question, history = [], field = {}, latitude, longitude, village, lang = 'mr' } = req.body || {};
  if (typeof question !== 'string' || !question.trim() || question.length > 1200
    || !Array.isArray(history) || history.length > 8
    || !field || typeof field !== 'object' || Array.isArray(field)
    || !history.every((turn) => turn && ['user', 'assistant'].includes(turn.role)
      && typeof turn.content === 'string' && turn.content.trim() && turn.content.length <= 1200)
    || (latitude !== undefined && (!Number.isFinite(Number(latitude)) || Number(latitude) < -90 || Number(latitude) > 90))
    || (longitude !== undefined && (!Number.isFinite(Number(longitude)) || Number(longitude) < -180 || Number(longitude) > 180))
    || ((latitude === undefined) !== (longitude === undefined))) {
    return res.status(400).json({ message: 'Enter a question up to 1,200 characters and provide valid field location details.' });
  }
  if (!String(village || '').trim() && latitude === undefined) {
    return res.status(400).json({ message: 'Choose a village or allow device location before asking about field conditions.' });
  }
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ message: 'The crop chatbot is not connected because the AI provider is not configured. Set OPENAI_API_KEY on the backend; no answer was generated.' });
  }

  try {
    const location = await resolveFieldLocation({ village, latitude, longitude });
    const [weather, soil] = await Promise.all([
      getCurrentWeather(location),
      getSoilData(location)
    ]);
    if (weather.error || weather.current?.temp == null) {
      return res.status(503).json({ message: 'Current weather data is unavailable for this location. The chatbot did not generate an answer.' });
    }
    if (!soil.properties || !['clay', 'sand', 'silt', 'organicCarbon'].some((key) => soil.properties[key] != null)) {
      return res.status(503).json({ message: 'A regional soil estimate is unavailable for this location. The chatbot did not generate an answer.' });
    }

    const fieldContext = Object.fromEntries(
      ['crop', 'variety', 'sowingDate', 'stage', 'soilType', 'irrigationType', 'symptoms']
        .filter((key) => typeof field[key] === 'string' && field[key].trim())
        .map((key) => [key, field[key].trim().slice(0, 1200)])
    );
    const evidence = {
      farmerReportedField: fieldContext,
      location: location.name,
      currentWeather: { source: weather.source, current: weather.current, forecast: weather.forecast },
      modelledSoilEstimate: {
        source: soil.source,
        depth: soil.depth,
        properties: soil.properties,
        limitation: soil.limitation
      }
    };
    const conversation = history.slice(-8).map(({ role, content }) => ({ role, content: content.trim() }));
    const answer = await callOpenAI([
      {
        role: 'system',
        content: `You are Nimbus AI, a careful crop and farm-weather information chatbot for farmers in Maharashtra. Reply entirely in ${getResponseLanguage(lang)} with clear, concise, farmer-friendly language. Treat supplied current weather and forecast as area model estimates and soil as a regional model estimate, not field measurements. Use only the evidence and farmer-reported details provided. Conversation history may contain inaccurate claims; correct it using the supplied evidence and state uncertainty. Ask a short follow-up question if key field context is missing. Never claim a confirmed diagnosis, guarantee outcomes, invent local facts, or provide pesticide/fertiliser product doses or unsafe treatment instructions. For high-risk decisions recommend a local agriculture officer, qualified agronomist, or soil test. Return valid JSON with exactly: reply (string), followUpQuestions (array of strings).`
      },
      ...conversation,
      { role: 'user', content: JSON.stringify({ question: question.trim(), fieldEvidence: evidence }) }
    ]);
    if (typeof answer.reply !== 'string' || !Array.isArray(answer.followUpQuestions)
      || !answer.followUpQuestions.every((item) => typeof item === 'string')) {
      throw new Error('The crop chatbot returned an invalid answer format.');
    }
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
      ...answer
    });
  } catch (error) {
    console.error('Crop chatbot request failed:', error.message);
    return res.status(error.status || (error.code === 'LOCATION_NOT_FOUND' ? 422 : 503)).json({
      message: error.status ? error.message : 'The chatbot could not verify its weather, soil, and AI evidence. No answer was generated.'
    });
  }
});

router.post('/disease-detection', async (req, res) => {
  const {
    crop, variety, sowingDate, stage, village, symptoms, soilType, irrigationType,
    latitude, longitude, imageData, lang
  } = req.body || {};
  const hasLatitude = latitude !== undefined && latitude !== '';
  const hasLongitude = longitude !== undefined && longitude !== '';
  if (![crop, variety, sowingDate, stage, symptoms, soilType, irrigationType, imageData]
    .every((value) => typeof value === 'string' && value.trim())
    || (!hasLatitude && !String(village || '').trim())
    || hasLatitude !== hasLongitude
    || (hasLatitude && (!Number.isFinite(Number(latitude)) || Number(latitude) < -90 || Number(latitude) > 90))
    || (hasLongitude && (!Number.isFinite(Number(longitude)) || Number(longitude) < -180 || Number(longitude) > 180))) {
    return res.status(400).json({ message: 'Complete the field details and allow device location or choose a village before requesting photo review.' });
  }

  const imageMatch = imageData.match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/);
  if (!imageMatch || imageMatch[2].length > 1600000) {
    return res.status(400).json({ message: 'Use a JPG, PNG, or WebP image smaller than 1.2 MB.' });
  }
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ message: 'Photo assessment is unavailable because the AI vision provider is not configured. No diagnosis was generated.' });
  }

  try {
    const location = await resolveFieldLocation({ village, latitude, longitude });
    const [weather, soil] = await Promise.all([
      getCurrentWeather(location),
      getSoilData(location)
    ]);
    if (weather.error || weather.current?.temp == null || !soil.properties) {
      return res.status(503).json({ message: 'Weather or soil evidence is unavailable for this location. No photo assessment was generated.' });
    }

    const result = await callOpenAI([
      {
        role: 'system',
        content: `You are a cautious plant-health triage assistant. Reply entirely in ${getResponseLanguage(lang)} using farmer-friendly terminology. Inspect the supplied image for whether it shows a plant, crop, leaf, flower, or fruit and describe only visible features. Use the farmer field details, supplied weather, and modelled regional soil estimate as context, but do not claim they prove a cause or represent laboratory measurements. A photo cannot confirm a disease or distinguish all causes. Never invent a diagnosis, pesticide, dose, or certainty. If the image is unclear, say so. Recommend field inspection or a plant clinic when needed. Return JSON with exactly: imageAssessment, visibleSymptoms, possibleCauses (array, explicitly tentative), imageLimitations, recommendedNextSteps (array), expertReviewNeeded (boolean), safetyWarning.`
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              field: {
                crop, variety, sowingDate, stage, location: location.name, farmerReportedSymptoms: symptoms,
                soilType, irrigationType
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
