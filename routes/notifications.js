const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { authMiddleware } = require('../middleware/auth');

// GET /api/notifications
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const notifications = await Notification.find({ user_id: req.user._id })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .lean();

    const formatted = notifications.map(n => ({
      ...n,
      created_at: n.createdAt
    }));

    res.json({ success: true, notifications: formatted });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', authMiddleware, async (req, res) => {
  try {
    await Notification.updateMany(
      { user_id: req.user._id, is_read: false },
      { $set: { is_read: true } }
    );
    res.json({ success: true, message: 'Semua notifikasi telah dibaca.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id },
      { $set: { is_read: true } },
      { new: true }
    );
    if (!notif) return res.status(404).json({ success: false, message: 'Notifikasi tidak ditemukan.' });
    res.json({ success: true, notification: notif });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

module.exports = router;
