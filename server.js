require('dotenv').config();
const express = require('express');
const { connectDB } = require('./db/mongodb');

const app = express();

// Middleware
app.use(express.json());
app.use(require('cors')());
app.use(express.static('public'));

// Koneksi DB sebelum routes
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (e) {
    res.status(500).json({ success: false, message: 'Database tidak dapat terhubung' });
  }
});

// Routes — Pure E-Learning Platform
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/courses',       require('./routes/courses'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/tutors',        require('./routes/tutors'));
app.use('/api/notifications', require('./routes/notifications'));

// Export untuk Vercel
module.exports = app;

// Development lokal:
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server Zeedone E-Learning berjalan di port ${PORT}`));
}