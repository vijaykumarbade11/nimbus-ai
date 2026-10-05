const express = require('express');
const { body, validationResult } = require('express-validator');
const Enquiry = require('../models/Enquiry');
const router = express.Router();

router.post('/', [
  body('name').notEmpty().withMessage('Name is required.'),
  body('mobile').isMobilePhone('en-IN').withMessage('Valid mobile number required.'),
  body('subject').notEmpty().withMessage('Subject is required.'),
  body('message').notEmpty().withMessage('Message is required.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const enquiry = await Enquiry.create(req.body);
    res.status(201).json({ message: 'Your enquiry has been submitted successfully.', enquiry });
  } catch (error) {
    res.status(500).json({ message: 'Could not save enquiry.', error: error.message });
  }
});

module.exports = router;
