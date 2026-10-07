const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const schemeRoutes = require('../routes/schemeRoutes');

test('scheme directory includes major central and Maharashtra programmes for farmer discovery', async () => {
  const app = express();
  app.use('/api/schemes', schemeRoutes);
  const server = app.listen(0, '127.0.0.1');

  try {
    await new Promise((resolve) => server.once('listening', resolve));
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/schemes`);
    const schemes = await response.json();
    const ids = new Set(schemes.map((scheme) => scheme._id));

    assert.equal(response.status, 200);
    assert.ok(schemes.length >= 10);
    assert.ok(ids.has('pm-kisan'));
    assert.ok(ids.has('pmfby'));
    assert.ok(ids.has('mahadbt-farmer'));
    assert.ok(ids.has('namo-shetkari'));
    assert.ok(schemes.every((scheme) => /^https:\/\//.test(scheme.officialUrl)));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
