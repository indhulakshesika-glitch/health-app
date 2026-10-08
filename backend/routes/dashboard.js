const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const total = await Medicine.countDocuments({ user_id: req.user._id });
    const active = await Medicine.countDocuments({ user_id: req.user._id, is_active: true });
    const recent = await Medicine.find({ user_id: req.user._id }).sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      data: {
        totalMedicines: total,
        activeMedicines: active,
        recentMedicines: recent,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
