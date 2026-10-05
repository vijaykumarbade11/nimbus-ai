const mongoose = require('mongoose');

const advisorySchema = new mongoose.Schema({
  crop: String,
  stage: String,
  weatherCondition: String,
  advice: String,
  irrigation: String,
  nutrition: String,
  pestMonitoring: String,
  diseaseMonitoring: String,
  nextActivity: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Advisory || mongoose.model('Advisory', advisorySchema);
