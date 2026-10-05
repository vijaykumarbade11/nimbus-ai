const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.log('ℹ️ MongoDB URI not configured. Database connections will remain disabled for local-only use.');
    return false;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully.');
    return true;
  } catch (error) {
    console.warn('⚠️ MongoDB connection failed. Continuing without database persistence.');
    console.warn(error.message);
    return false;
  }
};

module.exports = { connectDB };
