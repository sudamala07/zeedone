const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:   { type: String, required: true },
  body:    { type: String },
  type:    { type: String, enum: ['info', 'success', 'warning', 'achievement', 'welcome', 'course', 'subscription'], default: 'info' },
  is_read: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);