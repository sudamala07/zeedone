require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connectDB } = require('./mongodb');
const User = require('../models/User');
const Course = require('../models/Course');
const Tutor = require('../models/Tutor');
const Subscription = require('../models/Subscription');
const Notification = require('../models/Notification');
const Enrollment = require('../models/Enrollment');

async function seed() {
  await connectDB();

  console.log('[Seed] Membersihkan dan memperbarui data e-learning Zeedone...');

  const hash = await bcrypt.hash('zeedone123', 10);

  // Upsert Admin & Demo User
  let admin = await User.findOne({ email: 'admin@zeedone.id' });
  if (!admin) {
    admin = await User.create({
      name: 'Admin Zeedone',
      email: 'admin@zeedone.id',
      phone: '+6281234567890',
      password_hash: hash,
      role: 'admin'
    });
  }

  let demo = await User.findOne({ email: 'demo@zeedone.id' });
  if (!demo) {
    demo = await User.create({
      name: 'Pengguna Demo',
      email: 'demo@zeedone.id',
      phone: '+6285678901234',
      password_hash: hash,
      role: 'student'
    });
  }

  // Seed Courses with embedded real YouTube lessons
  const courseData = [
    {
      title: 'Dasar-Dasar Eksponen & Logaritma',
      subject: 'Matematika',
      description: 'Konsep dasar eksponen, sifat bilangan berpangkat, logaritma, dan trik cepat perhitungan SMA.',
      is_free: true,
      thumbnail: '🔢',
      instructor_id: admin._id,
      total_lessons: 4,
      duration_minutes: 100,
      rating: 4.9,
      total_students: 4820,
      level: 'Kelas 10',
      lessons: [
        { title: 'Eksponen – Konsep Bilangan Berpangkat & Sifat Dasar', youtube_id: 'VJdmwh-ECQo', duration: '22 mnt', level: 'Dasar' },
        { title: 'Eksponen Itu Asyik! – Study with Jerome Polin', youtube_id: 'AlrOq3W7IZ4', duration: '29 mnt', level: 'Dasar' },
        { title: 'Logaritma Itu Gampang! – Jerome Polin', youtube_id: 'FqYIq9kdshM', duration: '31 mnt', level: 'Menengah' },
        { title: 'Logaritma Kelas 10 – Pembahasan Soal Ujian', youtube_id: '3b8Kd4NsmDM', duration: '18 mnt', level: 'Lanjut' }
      ]
    },
    {
      title: 'Kalkulus & Turunan Fungsi Aljabar',
      subject: 'Matematika',
      description: 'Materi intensif konsep turunan fungsi aljabar, aplikasi titik stasioner, gradien garis singgung, dan persiapan UTBK.',
      is_free: false,
      thumbnail: '📐',
      instructor_id: admin._id,
      total_lessons: 3,
      duration_minutes: 72,
      rating: 4.8,
      total_students: 3150,
      level: 'Kelas 11',
      lessons: [
        { title: 'Konsep Dasar Turunan Fungsi & Notasi Leibniz', youtube_id: 'AmOeQUkMCPo', duration: '22 mnt', level: 'Dasar' },
        { title: 'Aturan Rantai & Turunan Fungsi Perkalian-Pembagian', youtube_id: 'wnq3sZfVERs', duration: '26 mnt', level: 'Menengah' },
        { title: 'Aplikasi Titik Maksimum & Minimum Soal UTBK', youtube_id: 'QqjcCvzWwww', duration: '24 mnt', level: 'Lanjut' }
      ]
    },
    {
      title: 'Kinematika Gerak Lurus & Parabola',
      subject: 'Fisika',
      description: 'Konsep GLB, GLBB, gerak vertikal ke atas, gerak jatuh bebas, dan lintasan proyektil parabola.',
      is_free: true,
      thumbnail: '⚡',
      instructor_id: admin._id,
      total_lessons: 3,
      duration_minutes: 68,
      rating: 4.7,
      total_students: 2790,
      level: 'Kelas 10',
      lessons: [
        { title: 'Besaran, Satuan & Vektor Fisika Dasar', youtube_id: '8xK_k5XJ_58', duration: '18 mnt', level: 'Dasar' },
        { title: 'Gerak Lurus Beraturan (GLB) & GLBB Analisis Grafik', youtube_id: 'e2X_t2P-2d4', duration: '25 mnt', level: 'Dasar' },
        { title: 'Gerak Parabola & Pembahasan Soal Tantangan', youtube_id: 'VJdmwh-ECQo', duration: '25 mnt', level: 'Menengah' }
      ]
    },
    {
      title: 'Fisika Modern & Teori Relativitas',
      subject: 'Fisika',
      description: 'Eksplorasi foton, efek fotolistrik, radiasi benda hitam, mekanika kuantum, dan relativitas khusus Einstein.',
      is_free: false,
      thumbnail: '🔬',
      instructor_id: admin._id,
      total_lessons: 3,
      duration_minutes: 78,
      rating: 4.9,
      total_students: 1980,
      level: 'Kelas 12',
      lessons: [
        { title: 'Postulat Relativitas Khusus & Dilatasi Waktu', youtube_id: 'AlrOq3W7IZ4', duration: '29 mnt', level: 'Dasar' },
        { title: 'Efek Fotolistrik & Dualisme Gelombang Partikel', youtube_id: 'FqYIq9kdshM', duration: '31 mnt', level: 'Menengah' },
        { title: 'Energi Foton & Latihan Soal Fisika Kuantum', youtube_id: '3b8Kd4NsmDM', duration: '18 mnt', level: 'Lanjut' }
      ]
    },
    {
      title: 'Stoikiometri & Hukum Dasar Kimia',
      subject: 'Kimia',
      description: 'Perhitungan mol, massa molar, hukum Lavoisier, Proust, Gay-Lussac, dan penyetaraan reaksi kimia.',
      is_free: true,
      thumbnail: '🧪',
      instructor_id: admin._id,
      total_lessons: 3,
      duration_minutes: 69,
      rating: 4.8,
      total_students: 3620,
      level: 'Kelas 10',
      lessons: [
        { title: 'Konsep Mol & Massa Atom Relatif (Ar/Mr)', youtube_id: '8xK_k5XJ_58', duration: '18 mnt', level: 'Dasar' },
        { title: 'Hukum-Hukum Dasar Kimia & Pembuktiannya', youtube_id: 'e2X_t2P-2d4', duration: '25 mnt', level: 'Dasar' },
        { title: 'Pereaksi Pembatas & Persen Hasil Reaksi', youtube_id: 'HE_9PX0vjJk', duration: '26 mnt', level: 'Menengah' }
      ]
    },
    {
      title: 'Kimia Organik & Senyawa Karbon',
      subject: 'Kimia',
      description: 'Gugus fungsi senyawa karbon, tata nama IUPAC, isomer, dan reaksi polimerisasi makromolekul.',
      is_free: false,
      thumbnail: '⚗️',
      instructor_id: admin._id,
      total_lessons: 3,
      duration_minutes: 67,
      rating: 4.9,
      total_students: 2430,
      level: 'Kelas 12',
      lessons: [
        { title: 'Alkana, Alkena & Alkuna – Tata Nama & Struktur', youtube_id: 'KNFVxzj6TCE', duration: '23 mnt', level: 'Dasar' },
        { title: 'Gugus Fungsi: Alkohol, Eter, Aldehid & Keton', youtube_id: '10ftb68aoSA', duration: '18 mnt', level: 'Menengah' },
        { title: 'Asam Karboksilat, Ester & Reaksi Polimerisasi', youtube_id: 'HE_9PX0vjJk', duration: '26 mnt', level: 'Lanjut' }
      ]
    },
    {
      title: 'Struktur Sel & Metabolisme Tubuh',
      subject: 'Biologi',
      description: 'Mekanisme organel sel, respirasi seluler (glikolisis, siklus krebs, transpor elektron), dan fotosintesis.',
      is_free: true,
      thumbnail: '🦠',
      instructor_id: admin._id,
      total_lessons: 3,
      duration_minutes: 69,
      rating: 4.8,
      total_students: 3200,
      level: 'Kelas 11',
      lessons: [
        { title: 'Organel Sel Tumbuhan vs Hewan & Fungsinya', youtube_id: '8xK_k5XJ_58', duration: '18 mnt', level: 'Dasar' },
        { title: 'Enzim & Cara Kerjanya dalam Metabolisme', youtube_id: 'e2X_t2P-2d4', duration: '25 mnt', level: 'Dasar' },
        { title: 'Respirasi Aerob & Anaerob: Tahapan Lengkap', youtube_id: 'HE_9PX0vjJk', duration: '26 mnt', level: 'Menengah' }
      ]
    },
    {
      title: 'Genetika & Bioteknologi Modern',
      subject: 'Biologi',
      description: 'Hukum Mendel, mutasi gen dan kromosom, rekayasa genetika, kloning, dan teknologi plasmid.',
      is_free: false,
      thumbnail: '🧬',
      instructor_id: admin._id,
      total_lessons: 3,
      duration_minutes: 67,
      rating: 4.9,
      total_students: 2150,
      level: 'Kelas 12',
      lessons: [
        { title: 'Hukum Mendel I & II: Monohibrid dan Dihibrid', youtube_id: 'KNFVxzj6TCE', duration: '23 mnt', level: 'Dasar' },
        { title: 'Struktur DNA, RNA & Sintesis Protein Lengkap', youtube_id: '10ftb68aoSA', duration: '18 mnt', level: 'Menengah' },
        { title: 'Bioteknologi Konvensional vs Modern & Rekayasa Gen', youtube_id: 'HE_9PX0vjJk', duration: '26 mnt', level: 'Lanjut' }
      ]
    },
    {
      title: 'Mastering English Grammar for High School',
      subject: 'Bahasa Inggris',
      description: 'Kuasai 16 tenses, passive voice, conditional sentences type 1-3, and modal verbs dengan mudah.',
      is_free: true,
      thumbnail: '📖',
      instructor_id: admin._id,
      total_lessons: 3,
      duration_minutes: 93,
      rating: 4.9,
      total_students: 5400,
      level: 'Kelas 10',
      lessons: [
        { title: '16 English Tenses Simplified – Full Explanation', youtube_id: '8e6J0NkMPbQ', duration: '35 mnt', level: 'Dasar' },
        { title: 'Passive Voice & Reported Speech Masterclass', youtube_id: 'xS_J0PkCFqM', duration: '30 mnt', level: 'Menengah' },
        { title: 'Conditional Sentences Type 1, 2, 3 in Practice', youtube_id: 'SxT2nTRbB_Y', duration: '28 mnt', level: 'Menengah' }
      ]
    },
    {
      title: 'TOEFL & IELTS High Score Strategy',
      subject: 'Bahasa Inggris',
      description: 'Bedah strategi kilat menjawab soal Structure & Written Expression, Reading Comprehension, dan Academic Writing.',
      is_free: false,
      thumbnail: '🎓',
      instructor_id: admin._id,
      total_lessons: 3,
      duration_minutes: 98,
      rating: 5.0,
      total_students: 4890,
      level: 'TOEFL/IELTS',
      lessons: [
        { title: 'TOEFL Structure – Fast Error Recognition Tactics', youtube_id: 'JK42eFIxxOA', duration: '28 mnt', level: 'Lanjut' },
        { title: 'IELTS Academic Reading – Band 7+ Tips & Skimming', youtube_id: 'tFr3wqNfbCY', duration: '35 mnt', level: 'Lanjut' },
        { title: 'IELTS Writing Task 1 & 2 – High Band Formulations', youtube_id: '8e6J0NkMPbQ', duration: '35 mnt', level: 'Lanjut' }
      ]
    },
    {
      title: 'Konsep Pendapatan Nasional & Kebijakan Fiskal',
      subject: 'Ekonomi',
      description: 'Menghitung GDP, GNP, NNP, NNI, DI, instrumen kebijakan moneter Bank Indonesia, dan APBN negara.',
      is_free: true,
      thumbnail: '🏦',
      instructor_id: admin._id,
      total_lessons: 3,
      duration_minutes: 69,
      rating: 4.7,
      total_students: 2100,
      level: 'Kelas 11',
      lessons: [
        { title: 'GDP, GNP, NNP – Konsep Dasar Pendapatan Nasional', youtube_id: 'Q6Jcp9AnnKA', duration: '24 mnt', level: 'Dasar' },
        { title: 'Pendapatan Per Kapita & Distribusi Gini Ratio', youtube_id: 'nRdRa6BxLkI', duration: '20 mnt', level: 'Menengah' },
        { title: 'Kebijakan Moneter & Fiskal – Peran BI dan Pemerintah', youtube_id: 'kKKM8Y-u7ds', duration: '25 mnt', level: 'Menengah' }
      ]
    },
    {
      title: 'Akuntansi Keuangan & Siklus Jurnal Umum',
      subject: 'Ekonomi',
      description: 'Persamaan dasar akuntansi, analisis transaksi debit-kredit, jurnal umum, buku besar, hingga neraca saldo.',
      is_free: false,
      thumbnail: '📒',
      instructor_id: admin._id,
      total_lessons: 3,
      duration_minutes: 72,
      rating: 4.8,
      total_students: 2870,
      level: 'Kelas 12',
      lessons: [
        { title: 'Konsep Dasar Akuntansi – Persamaan & Logika Akun', youtube_id: 'AmOeQUkMCPo', duration: '22 mnt', level: 'Dasar' },
        { title: 'Jurnal Umum – Analisis dan Pencatatan Transaksi Nyata', youtube_id: 'wnq3sZfVERs', duration: '26 mnt', level: 'Dasar' },
        { title: 'Posting Buku Besar & Penyusunan Neraca Saldo', youtube_id: 'QqjcCvzWwww', duration: '24 mnt', level: 'Menengah' }
      ]
    }
  ];

  // Clear and re-populate courses
  await Course.deleteMany({});
  const createdCourses = await Course.insertMany(courseData);
  console.log(`[Seed] ${createdCourses.length} kelas bervideo berhasil di-seed.`);

  // Seed Tutor Profiles
  const tutorData = [
    {
      name: 'Dr. Ahmad Fauzi, M.Pd',
      subjects: 'Matematika & Kalkulus',
      education: 'S3 Pendidikan Matematika - UGM',
      bio: 'Dosen dan praktisi bimbingan belajar dengan pengalaman 10+ tahun mengantarkan ribuan siswa tembus PTN favorit (UI, ITB, UGM).',
      rating: 4.9,
      total_students: 1250,
      avatar: '👨‍🏫'
    },
    {
      name: 'Ibu Sari Dewi, S.Pd, M.Si',
      subjects: 'Kimia & Biologi',
      education: 'S2 Biokimia - ITB',
      bio: 'Spesialis konsep dasar kimia dan biologi sel. Mengajar dengan analogi visual interaktif yang membuat rumus rumit terasa mudah.',
      rating: 4.9,
      total_students: 980,
      avatar: '👩‍🏫'
    },
    {
      name: 'Kak Rendi Pratama, M.A.',
      subjects: 'Bahasa Inggris, TOEFL & IELTS',
      education: 'S2 Applied Linguistics - Monash University',
      bio: 'Peraih skor TOEFL ITP 660 dan IELTS 8.5. Membimbing strategi cepat menjawab soal grammar dan reading secara taktis.',
      rating: 5.0,
      total_students: 2100,
      avatar: '🧑‍💻'
    },
    {
      name: 'Kak Dita Anggraini, S.Si',
      subjects: 'Fisika Dasar & Mekanika',
      education: 'S1 Fisika Murni - Universitas Indonesia',
      bio: 'Medalis olimpiade fisika nasional. Ahli menyederhanakan rumus vektor, gaya Newton, dan gerak melingkar tanpa hafalan buta.',
      rating: 4.8,
      total_students: 840,
      avatar: '👩‍🔬'
    },
    {
      name: 'Prof. Hendra Wijaya, S.E., M.Ec',
      subjects: 'Ekonomi & Akuntansi',
      education: 'S2 Master of Economics - UGM',
      bio: 'Penulis modul SNBT ekonomi dan akuntansi. Berfokus pada penalaran logika ekonomi makro dan siklus akuntansi praktis.',
      rating: 4.8,
      total_students: 1120,
      avatar: '👨‍💼'
    }
  ];

  await Tutor.deleteMany({});
  await Tutor.insertMany(tutorData);
  console.log(`[Seed] ${tutorData.length} profil tutor berhasil di-seed.`);

  // Seed sample enrollments for demo user on first free course
  await Enrollment.deleteMany({ user_id: demo._id });
  await Enrollment.create({
    user_id: demo._id,
    course_id: createdCourses[0]._id,
    progress: 50
  });

  // Notifications
  await Notification.deleteMany({ user_id: demo._id });
  await Notification.create([
    {
      user_id: demo._id,
      title: 'Selamat Datang di Zeedone! 🎓',
      body: 'Mulai petualangan belajarmu hari ini. Tonton video kelas gratis atau aktifkan paket langganan untuk akses penuh!',
      type: 'welcome'
    },
    {
      user_id: demo._id,
      title: 'Kamu Terdaftar di Kelas Baru 📚',
      body: `Kamu berhasil terdaftar di "${createdCourses[0].title}". Tonton materi videonya sekarang!`,
      type: 'course'
    }
  ]);

  console.log('[Seed] Seeding selesai! Platform siap digunakan.');
  console.log('Akun Login Demo: demo@zeedone.id / zeedone123');
  process.exit(0);
}

seed().catch(e => {
  console.error('[Seed Error]:', e);
  process.exit(1);
});