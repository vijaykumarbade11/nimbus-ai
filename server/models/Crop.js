const mongoose = require('mongoose');

const stageSchema = new mongoose.Schema({
  name: String,
  activities: [String],
  irrigation: String,
  nutrient: String,
  pestMonitoring: String,
  diseaseMonitoring: String,
  weather: String,
  harvestGuidance: String
}, { _id: false });

const cropSchema = new mongoose.Schema({
  name: String,
  marathiName: String,
  hindiName: String,
  stages: [stageSchema],
  season: String,
  soilTypes: [String],
  generalAdvisory: String
});

module.exports = mongoose.models.Crop || mongoose.model('Crop', cropSchema);
