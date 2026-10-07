const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const MedicationLog = require('../models/MedicationLog');
const HealthRecord = require('../models/HealthRecord');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/dashboard - full dashboard data
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Active medicines count
    const activeMedicines = await Medicine.countDocuments({
      user_id: userId,
      is_active: true,
      start_date: { $lte: now },
      end_date: { $gte: startOfDay }
    });

    // Today's logs
    const todayLogs = await MedicationLog.find({
      user_id: userId,
      scheduled_time: { $gte: startOfDay, $lte: endOfDay }
    }).populate('medicine_id', 'name dosage');

    const takenToday = todayLogs.filter(l => l.status === 'taken').length;
    const missedToday = todayLogs.filter(l => l.status === 'missed').length;
    const pendingToday = todayLogs.filter(l => l.status === 'pending').length;

    // Next upcoming dose
    const nextDose = todayLogs
      .filter(l => l.status === 'pending' && new Date(l.scheduled_time) > now)
      .sort((a, b) => new Date(a.scheduled_time) - new Date(b.scheduled_time))[0];

    // Latest health records
    const latestBP = await HealthRecord.findOne({ user_id: userId, type: 'bp' }).sort({ recorded_at: -1 });
    const latestSugar = await HealthRecord.findOne({ user_id: userId, type: 'sugar' }).sort({ recorded_at: -1 });
    const latestWeight = await HealthRecord.findOne({ user_id: userId, type: 'weight' }).sort({ recorded_at: -1 });

    // Weekly adherence
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weekLogs = await MedicationLog.find({
      user_id: userId,
      scheduled_time: { $gte: sevenDaysAgo }
    });
    const weekTaken = weekLogs.filter(l => l.status === 'taken').length;
    const weekTotal = weekLogs.length;
    const adherenceRate = weekTotal > 0 ? Math.round((weekTaken / weekTotal) * 100) : 0;

    res.json({
      success: true,
      data: {
        activeMedicines,
        todaySummary: { total: todayLogs.length, taken: takenToday, missed: missedToday, pending: pendingToday },
        nextDose: nextDose ? {
          medicine_name: nextDose.medicine_id?.name,
          scheduled_time: nextDose.scheduled_time,
          log_id: nextDose._id
        } : null,
        latestHealth: {
          bp: latestBP ? { value: latestBP.value, recorded_at: latestBP.recorded_at } : null,
          sugar: latestSugar ? { value: latestSugar.value, recorded_at: latestSugar.recorded_at } : null,
          weight: latestWeight ? { value: latestWeight.value, recorded_at: latestWeight.recorded_at } : null
        },
        adherenceRate
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
