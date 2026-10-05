const express = require('express');
const router = express.Router();

const orders = [];

router.get('/', (req, res) => res.json(orders));
router.get('/:id', (req, res) => {
  const order = orders.find((item) => item.id === req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found.' });
  res.json(order);
});

router.post('/', (req, res) => {
  const order = {
    id: Date.now().toString(),
    farmer: req.body.farmer || 'Farmer',
    products: req.body.products || [],
    total: req.body.total || 0,
    deliveryAddress: req.body.deliveryAddress || 'Ahmedpur, Latur',
    status: 'Pending',
    createdAt: new Date().toISOString()
  };
  orders.push(order);
  res.status(201).json(order);
});

module.exports = router;
