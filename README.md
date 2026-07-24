# Sistem Inventaris Laboratorium Komputer (LabInventory)

Dokumentasi lengkap dan terkini untuk proyek Ujian Akhir Semester (UAS) Sistem Inventaris Laboratorium Komputer. Sistem ini dikembangkan menggunakan arsitektur modern terpisah antara Backend (RESTful API berbasis Express.js dan TypeScript) serta Frontend (Next.js App Router dan TypeScript).

---

## Identitas Pengembang dan Tugas

* **Nama**: Muhammad Nafi Azka Soleiman
* **NIM**: 0102522017
* **Mata Kuliah**: UAS Pemrograman Web Dinamis
* **Program Studi**: Informatika
* **Institusi**: Universitas Al-Azhar Indonesia
* **Repository GitHub**: [0102522017_Sistem-Inventaris-Laboratorium-Komputer_-Muhammad-Nafi](https://github.com/muhammadnafi27/0102522017_Sistem-Inventaris-Laboratorium-Komputer_-Muhammad-Nafi)

---

## Deskripsi Singkat Sistem

LabInventory adalah aplikasi manajemen inventaris perangkat laboratorium komputer berbasis web. Aplikasi ini memfasilitasi pencatatan data barang, pemantauan kondisi perangkat, pengelolaan kategori, manajemen pengguna berbasis peran (Role-Based Access Control / RBAC), pencatatan log aktivitas sistem (audit trail), serta unggah foto barang dan profil.

Aplikasi ini dibangun tanpa menggunakan ORM (Object-Relational Mapping). Seluruh interaksi basis data diproses secara murni menggunakan library `mysql2/promise` dengan SQL query manual dan prepared statement untuk menjamin efisiensi performa serta keamanan terhadap ancaman SQL Injection.

---

## Fitur Utama Sistem

### 1. Autentikasi dan Otorisasi (RBAC)
* **Manajemen Sesi Keamanan**: Menggunakan JSON Web Token (JWT) yang disimpan secara aman dalam HTTP-Only Cookie dan didukung header Authorization Bearer.
* **Tiga Tingkat Hak Akses**:
  * **Admin**: Akses penuh ke seluruh sistem, termasuk manajemen pengguna, reset password pengguna, CRUD kategori, CRUD barang, upload foto, dan audit log aktivitas.
  * **Operator**: Akses untuk mengelola data barang (tambah, ubah, hapus, upload foto) serta mengelola data kategori.
  * **Viewer**: Akses terbatas hanya untuk membaca data (read-only) pada dashboard dan daftar barang.
* **Fitur Keamanan**: Enkripsi password menggunakan `bcryptjs`, proteksi rute berbasis middleware di backend dan Role Guard di frontend.

### 2. Dashboard Interaktif dan Sidebar Dynamic
* **Sidebar Interaktif**: Navigasi responsif dengan indikator rute aktif, lipat/kembang (collapsible), badge statistik, dan filter menu otomatis berdasarkan role pengguna.
* **Ringkasan Statistik**: Menampilkan metrik utama seperti total barang, total kategori, barang dalam kondisi perlu perawatan, dan barang rusak.
* **Visualisasi & Log Aktivitas**: Grafik sebaran kondisi perangkat dan daftar log aktivitas terbaru sistem.

### 3. Manajemen Inventaris Barang
* **CRUD Lengkap**: Operasi Tambah, Lihat Detail, Edit, dan Hapus data barang inventaris.
* **Pencarian dan Filter**: Fitur pencarian real-time berdasarkan kode atau nama barang, filter per kategori, serta filter kondisi barang (Baik, Perlu Perawatan, Rusak, Tidak Aktif).
* **Paginasi Data**: Mendukung penyajian data jumlah besar dengan navigasi halaman yang efisien.
* **Upload Foto Barang**: Integrasi middleware Multer untuk mengunggah foto perangkat dengan validasi tipe berkas dan batas ukuran berkas.

### 4. Manajemen Kategori Barang
* Pengelolaan kategori inventaris (seperti Komputer, Monitor, Proyektor, Printer, Jaringan, dan Aksesoris).
* Proteksi relasi database: Kategori tidak dapat dihapus jika masih terhubung dengan data barang aktif.

### 5. Manajemen Pengguna dan Profil (Khusus Admin)
* Pengelolaan akun pengguna mencakup tambah pengguna baru, pembaruan role, dan penghapusan pengguna.
* **Reset Password Backend**: Admin dapat mengatur ulang password pengguna yang lupa password melalui endpoint backend yang aman.
* **Pengaturan Profil**: Pengguna dapat memperbarui nama, email, password pribadi, serta mengunggah foto avatar profil.

### 6. Audit Trail dan Log Aktivitas Sistem
* Pencatatan otomatis setiap aktivitas krusial dalam sistem (LOGIN, CREATE, UPDATE, DELETE).
* Informasi log mencakup pengguna (user), IP address, jenis entitas yang diubah, dan timestamp kejadian.

---

## Arsitektur dan Teknologi

| Komponen | Teknologi / Library | Keterangan |
| :--- | :--- | :--- |
| **Backend Framework** | Node.js, Express.js, TypeScript | Berjalan pada Port `3000` |
| **Frontend Framework** | Next.js 15 (App Router), React 19, TypeScript | Berjalan pada Port `3001` |
| **Styling & UI** | Tailwind CSS, Lucide React Icons | Responsive UI & Modern Glassmorphism |
| **Database** | MySQL / MariaDB (XAMPP) | Database: `inventaris_laboratorium` |
| **Database Driver** | `mysql2/promise` | Prepared Statement tanpa ORM |
| **Autentikasi** | `jsonwebtoken`, `bcryptjs`, `cookie-parser` | JWT HTTP-Only Cookie & Bearer Token |
| **Validasi Input** | Zod | Validasi skema request di layer backend |
| **Upload Berkas** | Multer | Penanganan berkas foto profil dan barang |
| **Pengujian (Testing)** | Jest, Supertest | Pengujian otomatis unit & integrasi backend |

---

## Struktur Direktori Proyek

```text
labinventory/
├── backend/                  # RESTful API Application Server
│   ├── src/
│   │   ├── controller/       # Layer Pengendali Request API
│   │   ├── layanan/          # Logika Bisnis (Services)
│   │   ├── repository/       # Akses Database (Prepared SQL Queries)
│   │   ├── rute/             # Routing Endpoint API
│   │   ├── middleware/       # Autentikasi, Otorisasi, Unggah, Error Handler
│   │   ├── validasi/         # Skema Validasi Zod
│   │   ├── konfigurasi/      # Konfigurasi Database dan Environment
│   │   ├── tipe/             # Type Definitions TypeScript
│   │   ├── utilitas/         # Helper JWT, Cookie, Logger, Respons
│   │   └── server.ts         # Entry Point Backend Express
│   ├── tes/                  # Automated Integration Tests (Jest)
│   ├── unggahan/             # Penyimpanan berkas unggahan gambar
│   └── package.json
│
├── frontend/                 # Client App (Next.js App Router)
│   ├── src/
│   │   ├── app/              # Halaman Next.js (Dashboard, Login, Inventaris, User, Profil, etc.)
│   │   ├── fitur/            # Form dan Komponen Spesifik Fitur
│   │   ├── komponen/         # Komponen UI Reusable (Sidebar, Header, Guard, Modal)
│   │   ├── konteks/          # React Context (Auth Context)
│   │   ├── layanan-api/      # HTTP Client Integrasi Backend
│   │   ├── tipe/             # TypeScript Interfaces & Types
│   │   └── utilitas/         # Helper Format, Izin Role, Query String
│   └── package.json
│
├── database/                 # Skema dan Seed Data MySQL
│   └── inventaris.sql
│
└── README.md                 # Dokumentasi Lengkap Proyek
```

---

## Akun Demo Pengujian

Setelah mengimpor file `database/inventaris.sql`, akun pengujian berikut siap digunakan:

| Role | Email | Password Awal | Hak Akses Utama |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@uai.ac.id` | `admin12345` | Akses Penuh (User Management, Reset Password, CRUD Barang & Kategori, Log Aktivitas) |
| **Operator** | `staff@uai.ac.id` | `staff12345` | Kelola Barang & Kategori (CRUD Barang, Unggah Foto, Edit Kategori) |
| **Viewer** | `nafiazka2003@gmail.com` | `Nafi12345` | Read-Only (Melihat Dashboard & Daftar Inventaris) |

---

## Panduan Instalasi dan Pengoperasian

### 1. Persiapan Basis Data (MySQL / XAMPP)
1. Buka XAMPP Control Panel.
2. Aktifkan modul **Apache** dan **MySQL**.
3. Akses phpMyAdmin melalui browser (`http://localhost/phpmyadmin`).
4. Buat database baru bernama `inventaris_laboratorium` dan impor berkas `database/inventaris.sql`.

### 2. Konfigurasi dan Jalankan Server Backend
1. Buka terminal dan masuk ke direktori `backend`:
   ```bash
   cd backend
   ```
2. Salin berkas `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
3. Pasang dependensi dan jalankan server pengembangan:
   ```bash
   npm install
   npm run dev
   ```
   Server backend akan aktif di `http://localhost:3000`.

### 3. Konfigurasi dan Jalankan Aplikasi Frontend
1. Buka terminal terpisah dan masuk ke direktori `frontend`:
   ```bash
   cd frontend
   ```
2. Pasang dependensi dan jalankan server pengembangan:
   ```bash
   npm install
   npm run dev
   ```
3. Aplikasi frontend akan aktif di `http://localhost:3001`.

---

## Endpoint Utama REST API Backend

| Metode HTTP | Endpoint | Proteksi Role | Fungsi Utama |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Publik | Registrasi akun baru |
| `POST` | `/api/auth/login` | Publik | Login dan penerbitan JWT Cookie |
| `POST` | `/api/auth/logout` | Authenticated | Menghapus Cookie autentikasi |
| `GET` | `/api/auth/me` | Authenticated | Mengambil profil pengguna yang sedang login |
| `GET` | `/api/dashboard/ringkasan` | Authenticated | Statistik ringkasan dashboard |
| `GET` | `/api/barang` | Authenticated | Daftar barang dengan pencarian, filter, & paginasi |
| `POST` | `/api/barang` | Admin, Operator | Menambahkan barang baru |
| `PUT` | `/api/barang/:id` | Admin, Operator | Memperbarui data barang |
| `DELETE` | `/api/barang/:id` | Admin, Operator | Menghapus data barang |
| `POST` | `/api/barang/:id/upload-foto` | Admin, Operator | Mengunggah foto barang |
| `GET` | `/api/kategori` | Authenticated | Mendapatkan daftar kategori barang |
| `POST` | `/api/kategori` | Admin, Operator | Menambahkan kategori barang baru |
| `GET` | `/api/users` | Admin | Mendapatkan daftar seluruh pengguna |
| `POST` | `/api/users/:id/reset-password` | Admin | Reset password pengguna oleh Admin |
| `GET` | `/api/aktivitas` | Admin | Mendapatkan log audit aktivitas sistem |
