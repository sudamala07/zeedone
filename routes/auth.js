const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Subscription = require('../models/Subscription');
const Notification = require('../models/Notification');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Nama, email, dan password wajib diisi.' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ success: false, message: 'Email sudah terdaftar.' });

    if (password.length < 6)
      return res.status(400).json({ success: false, message: 'Password minimal 6 karakter.' });

    const hash = bcrypt.hashSync(password, 10);

    const newUser = await User.create({
      name, email, phone: phone || '', password_hash: hash
    });

    // Create a welcome notification
    await Notification.create({
      user_id: newUser._id,
      title: 'Selamat Datang di Zeedone! 🎓',
      body: 'Mulai petualangan belajarmu hari ini. Akses puluhan kelas gratis atau berlangganan untuk akses penuh!',
      type: 'welcome'
    });

    const token = jwt.sign({ id: newUser._id, email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil!',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        avatar: newUser.avatar
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email dan password wajib diisi.' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ success: false, message: 'Email atau password salah.' });

    const valid = bcrypt.compareSync(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ success: false, message: 'Email atau password salah.' });

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar
    };

    res.json({ success: true, message: 'Login berhasil!', token, user: safeUser });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { password_hash, ...user } = req.user;

    const [coursesCount, unreadCount, activeSub] = await Promise.all([
      Enrollment.countDocuments({ user_id: req.user._id }),
      Notification.countDocuments({ user_id: req.user._id, is_read: false }),
      Subscription.findOne({
        user_id: req.user._id,
        status: 'active',
        expires_at: { $gt: new Date() }
      }).sort({ expires_at: -1 }).lean()
    ]);

    res.json({
      success: true,
      user: {
        ...user,
        subscription: activeSub ? {
          plan: activeSub.plan,
          started_at: activeSub.started_at,
          expires_at: activeSub.expires_at,
          days_left: Math.max(0, Math.ceil((new Date(activeSub.expires_at) - new Date()) / (1000 * 60 * 60 * 24)))
        } : null,
        stats: {
          courses_enrolled: coursesCount,
          unread_notifications: unreadCount
        }
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Nama tidak boleh kosong.' });

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone: phone || '' },
      { new: true, select: 'name email phone role avatar' }
    ).lean();

    res.json({ success: true, message: 'Profil berhasil diperbarui.', user: updated });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password)
      return res.status(400).json({ success: false, message: 'Password lama dan baru wajib diisi.' });

    if (new_password.length < 6)
      return res.status(400).json({ success: false, message: 'Password baru minimal 6 karakter.' });

    const valid = bcrypt.compareSync(current_password, req.user.password_hash);
    if (!valid)
      return res.status(401).json({ success: false, message: 'Password lama salah.' });

    const hash = bcrypt.hashSync(new_password, 10);
    await User.findByIdAndUpdate(req.user._id, { password_hash: hash });
    res.json({ success: true, message: 'Password berhasil diubah.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

module.exports = router;
