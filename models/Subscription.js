const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan:       { type: String, enum: ['monthly', 'yearly'], required: true },
  price:      { type: Number, required: true },
  status:     { type: String, enum: ['active', 'cancelled', 'expired'], default: 'active' },
  started_at: { type: Date, default: Date.now },
  expires_at: { type: Date, required: true },
}, { timestamps: true });

// Index for fast query of user's active subscription
subscriptionSchema.index({ user_id: 1, status: 1, expires_at: -1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
