# Sistem Inventaris Laboratorium Komputer

Sistem web untuk mengelola kategori perangkat, barang inventaris, foto barang, serta user pengelola. 

## Prasyarat
- Node.js (v18+)
- npm
- MySQL (XAMPP atau server lokal lainnya)

## Database
1. Buat database `inventaris_laboratorium` di phpMyAdmin (atau biarkan script SQL yang membuatnya).
2. Impor file `database/inventaris.sql` ke MySQL.
3. Struktur tabel dan data demo beserta akun akan dibuat secara otomatis.

## Menjalankan Proyek (Tahap 1)

### Backend
1. Masuk ke folder backend: `cd backend`
2. Salin file environment: `cp .env.example .env` (kemudian sesuaikan konfigurasi database jika diperlukan).
3. Instal dependensi: `npm install`
4. Jalankan server: `npm run dev`
5. Backend akan berjalan di `http://localhost:3000`. Cek endpoint dengan mengakses `http://localhost:3000/api/kesehatan`.

### Frontend
1. Masuk ke folder frontend: `cd frontend`
2. Instal dependensi: `npm install`
3. Jalankan aplikasi: `npm run dev -- -p 3001`
4. Frontend akan berjalan di `http://localhost:3001`.
