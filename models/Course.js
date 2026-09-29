const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  youtube_id: { type: String, required: true },
  duration:   { type: String, default: '20 mnt' },
  level:      { type: String, default: 'Dasar' }
}, { _id: false });

const courseSchema = new mongoose.Schema({
  title:            { type: String, required: true },
  subject:          { type: String, required: true },
  description:      { type: String },
  is_free:          { type: Boolean, default: true },
  price:            { type: Number, default: 0 },
  original_price:   { type: Number },
  thumbnail:        { type: String },
  instructor_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  total_lessons:    { type: Number, default: 0 },
  duration_minutes: { type: Number, default: 0 },
  rating:           { type: Number, default: 4.8 },
  total_students:   { type: Number, default: 0 },
  level:            { type: String, default: 'Semua Level' },
  is_active:        { type: Boolean, default: true },
  lessons:          [lessonSchema]
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);