const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const productRoutes = require('../routes/productRoutes');
const marketRoutes = require('../routes/marketRoutes');

test('reference products do not expose unverified prices, stock, sellers, or photos', async () => {
  const app = express();
  app.use('/api/products', productRoutes);
  const server = app.listen(0, '127.0.0.1');

  try {
    await new Promise((resolve) => server.once('listening', resolve));
    const baseUrl = `http://127.0.0.1:${server.address().port}/api/products`;
    const response = await fetch(baseUrl);
    const products = await response.json();

    assert.equal(response.status, 200);
    assert.ok(products.length >= 10);
    assert.ok(products.every((product) => product.price === null));
    assert.ok(products.every((product) => product.marketPrice === null));
    assert.ok(products.every((product) => product.stock === null));
    assert.ok(products.every((product) => product.seller === null && product.image === null));
    assert.ok(products.every((product) => product.minOrder === 'Confirm with seller'));

    const createResponse = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test listing' })
    });

    assert.equal(createResponse.status, 405);
    assert.match((await createResponse.json()).message, /read-only/);

    const updateResponse = await fetch(`${baseUrl}/p1`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: 1 })
    });
    assert.equal(updateResponse.status, 405);

    const deleteResponse = await fetch(`${baseUrl}/p1`, { method: 'DELETE' });
    assert.equal(deleteResponse.status, 405);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('all-crop market report combines published varieties and rates with their sources', async () => {
  const axios = require('axios');
  const originalGet = axios.get;
  const app = express();
  app.use('/api/market-rates', marketRoutes);
  axios.get = async () => ({
    data: '<table><tr><td>Udgir</td><td>FAQ</td><td>quintal</td><td>12</td><td>5000</td><td>5500</td><td>5300</td></tr></table>'
  });
  const server = app.listen(0, '127.0.0.1');

  try {
    await new Promise((resolve) => server.once('listening', resolve));
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/market-rates?crop=all`);
    const data = await response.json();

    assert.equal(response.status, 200);
    assert.equal(data.reports.length, 5);
    assert.equal(data.rows.length, 5);
    assert.ok(data.rows.every((row) => row.market === 'Udgir'));
    assert.ok(data.rows.every((row) => row.variety === 'FAQ' && row.modal === '5300'));
    assert.ok(data.rows.every((row) => row.cropName));
    assert.ok(data.reports.every((report) => report.sourceUrl.startsWith('https://www.krushikranti.com/')));
  } finally {
    await new Promise((resolve) => server.close(resolve));
    axios.get = originalGet;
  }
});
