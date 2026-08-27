const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true
  },
  dosage: {
    type: String,
    required: [true, 'Dosage is required'],
    trim: true
  },
  times_per_day: {
    type: Number,
    required: [true, 'Times per day is required'],
    min: [1, 'Must be taken at least once a day'],
    max: [10, 'Cannot exceed 10 times per day']
  },
  reminder_times: {
    type: [String],
    required: [true, 'Reminder times are required'],
    validate: {
      validator: function (v) {
        return v.length > 0;
      },
      message: 'At least one reminder time is required'
    }
  },
  start_date: {
    type: Date,
    required: [true, 'Start date is required']
  },
  end_date: {
    type: Date,
    required: [true, 'End date is required']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  is_active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Medicine', medicineSchema);
