const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['bp', 'sugar', 'weight'],
    required: [true, 'Record type is required']
  },
  value: {
    type: String,
    required: [true, 'Value is required'],
    trim: true
  },
  systolic: { type: Number },  // for bp
  diastolic: { type: Number }, // for bp
  recorded_at: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [200, 'Notes cannot exceed 200 characters']
  }
}, { timestamps: true });

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
