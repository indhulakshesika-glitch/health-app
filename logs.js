const express = require('express');
const router = express.Router();
const MedicationLog = require('../models/MedicationLog');
const Medicine = require('../models/Medicine');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/logs - get all logs for user
router.get('/', async (req, res) => {
  try {
    const { date, medicine_id } = req.query;
    let query = { user_id: req.user._id };

    if (medicine_id) query.medicine_id = medicine_id;

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.scheduled_time = { $gte: startOfDay, $lte: endOfDay };
    }

    const logs = await MedicationLog.find(query)
      .populate('medicine_id', 'name dosage')
      .sort({ scheduled_time: 1 });

    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/logs - create a log entry
router.post('/', async (req, res) => {
  try {
    const { medicine_id, scheduled_time } = req.body;
    const medicine = await Medicine.findOne({ _id: medicine_id, user_id: req.user._id });
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });

    const log = await MedicationLog.create({
      medicine_id,
      user_id: req.user._id,
      scheduled_time: new Date(scheduled_time),
      status: 'pending'
    });

    res.status(201).json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/logs/:id/status - mark as taken or missed
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['taken', 'missed', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const update = { status };
    if (status === 'taken') update.taken_at = new Date();

    const log = await MedicationLog.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id },
      update,
      { new: true }
    ).populate('medicine_id', 'name dosage');

    if (!log) return res.status(404).json({ success: false, message: 'Log not found' });
    res.json({ success: true, data: log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/logs/today - get today's scheduled doses
router.get('/today', async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Get active medicines for user
    const medicines = await Medicine.find({
      user_id: req.user._id,
      is_active: true,
      start_date: { $lte: now },
      end_date: { $gte: startOfDay }
    });

    // Build today's schedule
    const todaySchedule = [];
    for (const med of medicines) {
      for (const time of med.reminder_times) {
        const [hours, minutes] = time.split(':').map(Number);
        const scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

        // Find or create log
        let log = await MedicationLog.findOne({
          medicine_id: med._id,
          user_id: req.user._id,
          scheduled_time: { $gte: startOfDay, $lte: endOfDay },
          $expr: {
            $and: [
              { $eq: [{ $hour: '$scheduled_time' }, hours] },
              { $eq: [{ $minute: '$scheduled_time' }, minutes] }
            ]
          }
        });

        if (!log) {
          log = await MedicationLog.create({
            medicine_id: med._id,
            user_id: req.user._id,
            scheduled_time: scheduledTime,
            status: scheduledTime < now ? 'missed' : 'pending'
          });
        }

        todaySchedule.push({
          log_id: log._id,
          medicine_id: med._id,
          medicine_name: med.name,
          dosage: med.dosage,
          scheduled_time: scheduledTime,
          status: log.status,
          taken_at: log.taken_at,
          notes: med.notes
        });
      }
    }

    todaySchedule.sort((a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time));
    res.json({ success: true, data: todaySchedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/logs/history - medication history
router.get('/history', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const logs = await MedicationLog.find({
      user_id: req.user._id,
      scheduled_time: { $gte: startDate }
    })
      .populate('medicine_id', 'name dosage')
      .sort({ scheduled_time: -1 });

    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
