const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  farmer: String,
  products: [{ name: String, quantity: Number, price: Number }],
  total: Number,
  deliveryAddress: String,
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);
