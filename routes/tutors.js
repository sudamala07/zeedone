const express = require('express');
const router = express.Router();
const Tutor = require('../models/Tutor');
const { authMiddleware, adminOnly, optionalAuth } = require('../middleware/auth');

// GET /api/tutors - List tutor profiles
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { subject, search, sort, limit = 20, offset = 0 } = req.query;
    const filter = { is_active: true };

    if (subject) filter.subjects = { $regex: subject, $options: 'i' };
    if (search) {
      filter.$or = [
        { name:     { $regex: search, $options: 'i' } },
        { subjects: { $regex: search, $options: 'i' } },
        { bio:      { $regex: search, $options: 'i' } },
        { education:{ $regex: search, $options: 'i' } }
      ];
    }

    let sortOpt = { rating: -1, total_students: -1 };
    if (sort === 'rating')   sortOpt = { rating: -1 };
    if (sort === 'popular')  sortOpt = { total_students: -1 };

    const [tutors, total] = await Promise.all([
      Tutor.find(filter).sort(sortOpt).skip(Number(offset)).limit(Number(limit)).lean(),
      Tutor.countDocuments(filter)
    ]);

    res.json({ success: true, total, tutors });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// GET /api/tutors/:id - Single tutor profile
router.get('/:id', async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ _id: req.params.id, is_active: true }).lean();
    if (!tutor) return res.status(404).json({ success: false, message: 'Tutor tidak ditemukan.' });
    res.json({ success: true, tutor });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

// POST /api/tutors (admin only)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, subjects, bio, education, avatar, rating } = req.body;
    if (!name || !subjects)
      return res.status(400).json({ success: false, message: 'Nama dan mata pelajaran wajib diisi.' });

    const tutor = await Tutor.create({
      name,
      subjects,
      bio: bio || '',
      education: education || '',
      avatar: avatar || '👨‍🏫',
      rating: Number(rating) || 4.8
    });

    res.status(201).json({ success: true, message: 'Profil tutor berhasil ditambahkan.', id: tutor._id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
  }
});

module.exports = router;
