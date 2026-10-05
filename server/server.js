require('dotenv').config({ path: '../.env' });
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { connectDB } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com'],
      fontSrc: ["'self'", 'https://cdnjs.cloudflare.com'],
      imgSrc: ["'self'", 'data:', 'https://images.unsplash.com'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'self'"]
    }
  }
}));
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

connectDB();

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/weather', require('./routes/weatherRoutes'));
app.use('/api/soil', require('./routes/soilRoutes'));
app.use('/api/crops', require('./routes/cropRoutes'));
app.use('/api/advisory', require('./routes/advisoryRoutes'));
app.use('/api/schemes', require('./routes/schemeRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/market-rates', require('./routes/marketRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Nimbus AI API is running.', environment: process.env.NODE_ENV || 'development' });
});

app.use(express.static(path.join(__dirname, '../client')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error.', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Nimbus AI server is running on http://localhost:${PORT}`);
});
