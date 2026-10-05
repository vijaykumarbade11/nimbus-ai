const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  village: String,
  taluka: String,
  district: String,
  state: String,
  language: { type: String, default: 'mr' },
  farmSize: String,
  mainCrops: [String],
  soilType: String,
  irrigationType: String,
  password: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Farmer || mongoose.model('Farmer', farmerSchema);
