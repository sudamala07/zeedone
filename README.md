# Zeedone

Zeedone adalah platform e-learning berbasis web. Versi ini berfokus pada dua hal:

- **Tutor belajar online berbasis video** (Matematika, Fisika, Kimia, Biologi, Ekonomi, Bahasa Inggris)
- **Interaksi sosial antar-user** (diskusi/komentar)

**Tech stack:** Node.js + Express, MongoDB Atlas (via Mongoose), Docker.

---

## Status Pengembangan

| Modul | Status |
|---|---|
| Register, login, dashboard | Berfungsi |
| Kelas dan video pembelajaran | Berfungsi |
| Games, Shop, Wallet | Tidak aktif (fitur dipangkas, tidak diperbaiki) |
| "Kelas Populer" dan "Aktivitas Terkini" di Beranda | Masih dalam perbaikan |

Migrasi database dari SQL ke MongoDB masih berjalan, jadi beberapa modul lama mungkin belum berfungsi.

---

## Cara Menjalankan dengan Docker

Dengan Docker, kamu **tidak perlu menginstall Node.js** di komputer. Semua environment sudah dibungkus di dalam image.

### 1. Prasyarat

- **Git**: https://git-scm.com/downloads
- **Docker Desktop**: https://www.docker.com/products/docker-desktop/
  - Di Windows, Docker Desktop membutuhkan **WSL2** (biasanya ditawarkan otomatis saat instalasi).
  - Setelah install, restart komputer lalu buka Docker Desktop dan tunggu sampai status di pojok kiri bawah menunjukkan **"Engine running"**.

Cek instalasi dengan membuka terminal baru:

```bash
git --version
docker --version
```

### 2. Clone repository

```bash
git clone https://github.com/sudamala07/zeedone.git
cd zeedone
```

### 3. Siapkan file `.env`

File `.env` **tidak ikut di repository** karena berisi kredensial database. Buat sendiri di root folder proyek (sejajar dengan `Dockerfile` dan `server.js`):

```
MONGODB_URI=isi_connection_string_dari_pemilik_proyek
```

- Minta nilai `MONGODB_URI` langsung ke pemilik proyek lewat chat pribadi. **Jangan pernah** membagikannya lewat GitHub, komentar, atau grup publik.
- Jangan menaruh spasi atau tanda kutip di sekitar nilainya.
- Jangan commit file `.env` ke Git (sudah masuk `.gitignore`).

### 4. Build image

Jalankan dari root folder proyek:

```bash
docker build -t zeedone-app .
```

Proses pertama membutuhkan waktu sekitar setengah menit karena Docker mengunduh base image `node:20-alpine` dan menginstall dependency.

### 5. Jalankan container

```bash
docker run -p 3000:3000 --env-file .env zeedone-app
```

Biarkan terminal tetap terbuka. Menutup terminal akan menghentikan container.

### 6. Buka aplikasi

Buka browser ke:

```
http://localhost:3000
```

Kamu akan melihat splash screen Zeedone. Coba alur **daftar, login, lalu dashboard**.

### 7. Menghentikan container

- Di terminal tempat container berjalan, tekan `Ctrl + C`, **atau**
- Buka Docker Desktop, tab **Containers**, lalu klik tombol **Stop**, **atau**
- Dari terminal lain:

  ```bash
  docker ps
  docker stop <CONTAINER_ID>
  ```

---

## Perintah Docker yang Berguna

| Perintah | Fungsi |
|---|---|
| `docker images` | Melihat daftar image yang tersimpan |
| `docker ps` | Melihat container yang sedang berjalan |
| `docker ps -a` | Melihat semua container, termasuk yang sudah berhenti |
| `docker stop <id>` | Menghentikan container |
| `docker history zeedone-app` | Melihat layer dan ukuran image |
| `docker build -t zeedone-app .` | Build ulang image setelah kode berubah |

Setelah mengubah kode, jalankan `docker build` lagi sebelum `docker run`, karena container memakai salinan kode saat build, bukan file di folder kamu secara langsung.

---

## Troubleshooting

**`'docker' is not recognized` / `docker: command not found`**
Docker Desktop belum terinstall atau terminal belum di-refresh. Install Docker Desktop, lalu tutup semua terminal dan editor, buka lagi.

**`Cannot connect to the Docker daemon`**
Docker Desktop belum berjalan. Buka aplikasinya dan tunggu status "Engine running".

**`'git' is not recognized`**
Install Git for Windows, lalu tutup dan buka ulang terminal.

**`port is already allocated` / port 3000 sudah dipakai**
Ada proses lain (misalnya `node server.js` biasa atau container lama) yang memakai port 3000. Hentikan proses itu, atau jalankan di port lain:

```bash
docker run -p 3001:3000 --env-file .env zeedone-app
```

lalu buka `http://localhost:3001`.

**Server berjalan tapi gagal konek ke MongoDB (timeout / `ECONNREFUSED` / authentication failed)**
- Pastikan `MONGODB_URI` di `.env` benar dan lengkap.
- Di MongoDB Atlas, buka **Network Access**, lalu pastikan IP komputer kamu sudah masuk **IP Access List** (minta pemilik proyek menambahkannya).
- Pastikan username database kamu terdaftar di **Database Access**.

**Ubah kode tapi tampilan tidak berubah**
Image belum di-build ulang. Jalankan `docker build -t zeedone-app .` lalu `docker run` lagi.

**Pesan `got 3 SIGTERM/SIGINTs, forcefully exiting` saat Ctrl+C**
Normal. Aplikasi belum punya penanganan graceful shutdown. Jika container masih terlihat aktif di `docker ps`, hentikan dengan `docker stop <id>`.

---

## Struktur Proyek

```
.
├── Dockerfile          # Resep pembuatan image
├── .dockerignore       # File yang tidak ikut masuk image
├── server.js           # Entry point Express
├── package.json
├── db/                 # Koneksi MongoDB dan seed data
├── middleware/         # Middleware (autentikasi)
├── models/             # Model Mongoose (User, Course, Enrollment, dll)
├── routes/             # Route API (auth, courses, dll)
└── public/             # Frontend (index.html)
```

---

## Tanpa Docker (opsional)

Jika sudah memiliki Node.js 20 di komputer:

```bash
npm install
node server.js
```

Pastikan file `.env` sudah dibuat seperti langkah 3.

---

## Catatan Keamanan

- Jangan pernah commit `.env` atau kredensial apa pun ke repository.
- Jika `MONGODB_URI` tidak sengaja ter-upload, segera ganti password database user di MongoDB Atlas.
