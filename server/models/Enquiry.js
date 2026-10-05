const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  name: String,
  mobile: String,
  village: String,
  subject: String,
  message: String,
  image: String,
  status: { type: String, default: 'New' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Enquiry || mongoose.model('Enquiry', enquirySchema);
