const express = require('express');

const router = express.Router();

router.all('*', (req, res) => res.status(503).json({
  message: 'Order management is unavailable. No order was placed or saved.'
}));

module.exports = router;
