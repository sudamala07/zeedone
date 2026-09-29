const mongoose = require('mongoose');

const tutorSchema = new mongoose.Schema({
  user_id:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name:           { type: String, required: true },
  subjects:       { type: String, required: true },
  bio:            { type: String },
  rating:         { type: Number, default: 4.8 },
  total_students: { type: Number, default: 0 },
  education:      { type: String },
  avatar:         { type: String, default: '👨‍🏫' },
  is_active:      { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Tutor', tutorSchema);