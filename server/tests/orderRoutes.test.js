const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const orderRoutes = require('../routes/orderRoutes');

test('unavailable order service never reports an order as placed or saved', async () => {
  const app = express();
  app.use(express.json());
  app.use('/api/orders', orderRoutes);
  const server = app.listen(0, '127.0.0.1');

  try {
    await new Promise((resolve) => server.once('listening', resolve));
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products: [{ id: 'p1' }], total: 99 })
    });
    const result = await response.json();

    assert.equal(response.status, 503);
    assert.match(result.message, /No order was placed or saved/);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
