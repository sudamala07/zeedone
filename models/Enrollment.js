const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  user_id:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  progress:     { type: Number, default: 0, min: 0, max: 100 },
  completed_at: { type: Date },
}, { timestamps: true });

enrollmentSchema.index({ user_id: 1, course_id: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);