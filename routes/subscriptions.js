const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const Notification = require('../models/Notification');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

const PLANS = {
  monthly: {
    id: 'monthly',
    name: 'Paket Bulanan',
    price: 49000,
    duration_days: 30,
    tagline: 'Cocok untuk coba-coba & belajar intensif',
    features: [
      'Akses semua kelas berbayar tanpa batas',
      'Video materi & latihan soal lengkap',
      'Sertifikat digital setelah lulus kelas',
      'Dukungan tutor & diskusi materi'
    ]
  },
  yearly: {
    id: 'yearly',
    name: 'Paket Tahunan',
    price: 399000,
    duration_days: 365,
    tagline: 'Paling hemat! Hemat hingga 32% setahun',
    badge: 'PALING HEMAT',
    features: [
      'Semua fitur Paket Bulanan',
      'Akses 365 hari penuh tanpa henti',
      'Prioritas materi baru & update kurikulum',
      'Bonus modul ringkasan ujian nasional & UTBK'
    ]
  }
};

// GET /api/subscriptions/plans (Public)
router.get('/plans', (req, res) => {
  res.json({
    success: true,
    plans: Object.values(PLANS)
  });
});

// GET /api/subscriptions/status (Auth)
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const activeSub = await Subscription.findOne({
      user_id: req.user._id,
      status: 'active',
      expires_at: { $gt: new Date() }
    }).sort({ expires_at: -1 }).lean();

    if (!activeSub) {
      return res.json({
        success: true,
        is_subscribed: false,
        subscription: null
      });
    }

    const now = new Date();
    const daysLeft = Math.max(0, Math.ceil((new Date(activeSub.expires_at) - now) / (1000 * 60 * 60 * 24)));

    res.json({
      success: true,
      is_subscribed: true,
      subscription: {
        ...activeSub,
        plan_details: PLANS[activeSub.plan] || null,
        days_left: daysLeft
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// POST /api/subscriptions/subscribe (Auth)
router.post('/subscribe', authMiddleware, async (req, res) => {
  try {
    const { plan } = req.body;
    const selectedPlan = PLANS[plan];

    if (!selectedPlan) {
      return res.status(400).json({
        success: false,
        message: 'Paket langganan tidak valid. Pilih "monthly" atau "yearly".'
      });
    }

    // Check if user already has an active subscription
    const existing = await Subscription.findOne({
      user_id: req.user._id,
      status: 'active',
      expires_at: { $gt: new Date() }
    }).sort({ expires_at: -1 });

    const now = new Date();
    let startDate = now;
    let expiresDate = new Date();

    if (existing) {
      // Extend existing subscription
      startDate = existing.started_at;
      expiresDate = new Date(existing.expires_at.getTime() + (selectedPlan.duration_days * 24 * 60 * 60 * 1000));
      existing.expires_at = expiresDate;
      existing.plan = selectedPlan.id;
      existing.price = selectedPlan.price;
      await existing.save();
    } else {
      // Create new subscription
      expiresDate = new Date(now.getTime() + (selectedPlan.duration_days * 24 * 60 * 60 * 1000));
      await Subscription.create({
        user_id: req.user._id,
        plan: selectedPlan.id,
        price: selectedPlan.price,
        status: 'active',
        started_at: startDate,
        expires_at: expiresDate
      });
    }

    // Notification
    await Notification.create({
      user_id: req.user._id,
      title: 'Langganan Aktif! 🌟',
      body: `Selamat! Kamu telah berlangganan ${selectedPlan.name}. Sekarang kamu bebas mengakses seluruh kelas berbayar Zeedone.`,
      type: 'subscription'
    });

    const daysLeft = Math.ceil((expiresDate - now) / (1000 * 60 * 60 * 24));

    res.json({
      success: true,
      message: `Berhasil mengaktifkan ${selectedPlan.name}!`,
      subscription: {
        plan: selectedPlan.id,
        name: selectedPlan.name,
        expires_at: expiresDate,
        days_left: daysLeft
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// POST /api/subscriptions/cancel (Auth)
router.post('/cancel', authMiddleware, async (req, res) => {
  try {
    const sub = await Subscription.findOneAndUpdate(
      { user_id: req.user._id, status: 'active', expires_at: { $gt: new Date() } },
      { $set: { status: 'cancelled' } },
      { new: true }
    );

    if (!sub) {
      return res.status(404).json({ success: false, message: 'Tidak ada langganan aktif yang ditemukan.' });
    }

    await Notification.create({
      user_id: req.user._id,
      title: 'Langganan Dibatalkan ℹ️',
      body: 'Paket langganan kamu telah dibatalkan.',
      type: 'info'
    });

    res.json({ success: true, message: 'Langganan berhasil dibatalkan.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

module.exports = router;
