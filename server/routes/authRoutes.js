const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const Farmer = require('../models/Farmer');

const router = express.Router();

const databaseAvailable = () => Boolean(process.env.MONGODB_URI) && mongoose.connection.readyState === 1;

const generateToken = (farmer) => jwt.sign({ id: farmer._id, mobile: farmer.mobile }, process.env.JWT_SECRET || 'nimbus-ai-local-secret', { expiresIn: '7d' });

router.post('/register', [
  body('name').notEmpty().withMessage('Name is required.'),
  body('mobile').isMobilePhone('en-IN').withMessage('Valid Indian mobile number is required.'),
  body('village').optional().notEmpty(),
  body('district').optional().notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  if (!databaseAvailable()) {
    return res.status(503).json({ message: 'Farmer registration is unavailable until the database is configured.' });
  }

  const { name, mobile, village, taluka, district, state, language, farmSize, mainCrops, soilType, irrigationType, password } = req.body;

  try {
    if (databaseAvailable()) {
      const existing = await Farmer.findOne({ mobile });
      if (existing) {
        return res.status(409).json({ message: 'Farmer already exists.' });
      }
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
    const farmer = await Farmer.create({
      name,
      mobile,
      village,
      taluka,
      district,
      state,
      language: language || 'mr',
      farmSize,
      mainCrops: mainCrops || [],
      soilType,
      irrigationType,
      password: hashedPassword
    });

    return res.status(201).json({ token: generateToken(farmer), farmer: { ...farmer.toObject ? farmer.toObject() : farmer, password: undefined } });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating farmer account.', error: error.message });
  }
});

router.post('/login', [
  body('mobile').isMobilePhone('en-IN').withMessage('Valid mobile number required.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  if (!databaseAvailable()) {
    return res.status(503).json({ message: 'Farmer login is unavailable until the database is configured.' });
  }

  const mobile = String(req.body.mobile || '').trim();

  try {
    const farmer = await Farmer.findOne({ mobile });
    if (!farmer) {
      return res.status(401).json({ message: 'No farmer account was found for this mobile number.' });
    }

    let valid = true;
    if (req.body.password && farmer.password) {
      valid = await bcrypt.compare(req.body.password, farmer.password);
    }

    if (!valid) {
      return res.status(401).json({ message: 'Incorrect credentials.' });
    }

    return res.json({
      token: generateToken(farmer),
      farmer: { ...farmer.toObject ? farmer.toObject() : farmer, password: undefined }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error logging in.', error: error.message });
  }
});

module.exports = router;
