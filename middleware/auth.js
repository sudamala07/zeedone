require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { connectDB } = require('../db/mongodb');

const JWT_SECRET = process.env.JWT_SECRET || 'zeedone_super_secret_key_2025';

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token tidak ditemukan.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    await connectDB();
    const user = await User.findById(decoded.id).lean();
    if (!user) return res.status(401).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: 'Token tidak valid atau kadaluarsa.' });
  }
}

async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      await connectDB();
      req.user = await User.findById(decoded.id).lean();
    } catch (_) {}
  }
  next();
}

function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Akses ditolak. Hanya admin.' });
  }
  next();
}

module.exports = { authMiddleware, optionalAuth, adminOnly, JWT_SECRET };