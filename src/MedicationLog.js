const mongoose = require('mongoose');

const medicationLogSchema = new mongoose.Schema({
  medicine_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scheduled_time: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'taken', 'missed'],
    default: 'pending'
  },
  taken_at: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('MedicationLog', medicationLogSchema);
