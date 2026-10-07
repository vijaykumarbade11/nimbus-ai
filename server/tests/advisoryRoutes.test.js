const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const advisoryRoutes = require('../routes/advisoryRoutes');

test('field and photo advice accept GPS without requiring soil laboratory values', async () => {
  const originalOpenAiKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  const app = express();
  app.use(express.json({ limit: '2mb' }));
  app.use('/api/advisory', advisoryRoutes);
  const server = app.listen(0, '127.0.0.1');

  try {
    await new Promise((resolve) => server.once('listening', resolve));
    const baseUrl = `http://127.0.0.1:${server.address().port}/api/advisory`;
    const field = {
      crop: 'Soybean',
      variety: 'JS-335',
      sowingDate: '2026-03-15',
      soilType: 'Medium black soil',
      irrigationType: 'Rainfed',
      stage: 'Vegetative Growth',
      symptoms: 'No visible symptoms',
      latitude: 18.7,
      longitude: 76.9,
      lang: 'mr'
    };

    const fieldResponse = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(field)
    });

    assert.equal(fieldResponse.status, 503);
    assert.match((await fieldResponse.json()).message, /AI provider is not configured/);

    const photoResponse = await fetch(`${baseUrl}/disease-detection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...field,
        imageData: 'data:image/jpeg;base64,YQ=='
      })
    });
    assert.equal(photoResponse.status, 503);
    assert.match((await photoResponse.json()).message, /AI vision provider is not configured/);

    const missingLocationResponse = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...field, latitude: undefined, longitude: undefined })
    });
    assert.equal(missingLocationResponse.status, 400);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    if (originalOpenAiKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalOpenAiKey;
  }
});

test('crop chatbot requires an AI provider and never returns a demo answer', async () => {
  const originalOpenAiKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  const app = express();
  app.use(express.json({ limit: '2mb' }));
  app.use('/api/advisory', advisoryRoutes);
  const server = app.listen(0, '127.0.0.1');

  try {
    await new Promise((resolve) => server.once('listening', resolve));
    const baseUrl = `http://127.0.0.1:${server.address().port}/api/advisory/chat`;
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: 'Should I irrigate today?',
        village: 'Ahmedpur',
        field: { crop: 'Soybean', stage: 'Flowering' },
        lang: 'mr'
      })
    });
    const data = await response.json();

    assert.equal(response.status, 503);
    assert.match(data.message, /OPENAI_API_KEY/);
    assert.equal(data.reply, undefined);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    if (originalOpenAiKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalOpenAiKey;
  }
});
