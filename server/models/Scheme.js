const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
  name: String,
  marathiName: String,
  hindiName: String,
  department: String,
  category: String,
  eligibility: String,
  benefits: String,
  documents: [String],
  applicationProcess: String,
  officialUrl: String,
  lastVerified: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Scheme || mongoose.model('Scheme', schemeSchema);
