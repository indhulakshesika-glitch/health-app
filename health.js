const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const HealthRecord = require('../models/HealthRecord');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/health - get all records
router.get('/', async (req, res) => {
  try {
    const { type, days = 30 } = req.query;
    let query = { user_id: req.user._id };

    if (type) query.type = type;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    query.recorded_at = { $gte: startDate };

    const records = await HealthRecord.find(query).sort({ recorded_at: -1 });
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/health - add new record
router.post('/', [
  body('type').isIn(['bp', 'sugar', 'weight']).withMessage('Type must be bp, sugar, or weight'),
  body('value').notEmpty().withMessage('Value is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const record = await HealthRecord.create({ ...req.body, user_id: req.user._id });
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/health/:id
router.delete('/:id', async (req, res) => {
  try {
    const record = await HealthRecord.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/health/stats - aggregated stats for charts
router.get('/stats', async (req, res) => {
  try {
    const { type, period = 'weekly' } = req.query;
    const days = period === 'monthly' ? 30 : 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let query = { user_id: req.user._id, recorded_at: { $gte: startDate } };
    if (type) query.type = type;

    const records = await HealthRecord.find(query).sort({ recorded_at: 1 });
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
