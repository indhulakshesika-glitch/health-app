const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Medicine = require('../models/Medicine');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const medicines = await Medicine.find({ user_id: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: medicines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Medicine name is required'),
    body('dosage').trim().notEmpty().withMessage('Dosage is required'),
    body('times_per_day').isInt({ min: 1, max: 10 }).withMessage('Times per day must be between 1 and 10'),
    body('reminder_times').isArray({ min: 1 }).withMessage('At least one reminder time is required'),
    body('start_date').isISO8601().withMessage('Start date is required'),
    body('end_date').isISO8601().withMessage('End date is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const medicine = await Medicine.create({ ...req.body, user_id: req.user._id });
      res.status(201).json({ success: true, data: medicine });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

router.put('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    res.json({ success: true, data: medicine });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });

    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    res.json({ success: true, message: 'Medicine deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
