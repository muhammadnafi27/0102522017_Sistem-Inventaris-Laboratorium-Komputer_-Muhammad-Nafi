# LabInventory - Sistem Inventaris Laboratorium Komputer

Aplikasi web pengelolaan inventaris laboratorium komputer dengan autentikasi JWT dan
pembatasan akses berdasarkan role **admin**, **operator**, dan **viewer**. Backend dan
frontend berjalan terpisah, database diakses murni dengan `mysql2/promise` dan SQL manual
(prepared statement) tanpa ORM.

> Status: fondasi proyek (Tahap 1 dari 10). Fitur autentikasi, CRUD, upload, dan UI penuh
> akan ditambahkan pada tahap-tahap berikutnya sesuai rencana implementasi pada
> `Invetaris_prd.pdf`.

## Teknologi

| Bagian   | Teknologi                                                        |
| -------- | ----------------------------------------------------------------- |
| Backend  | Express.js + TypeScript (port **3000**)                          |
| Frontend | Next.js App Router + TypeScript + Tailwind CSS (port **3001**)   |
| Database | MySQL/MariaDB via XAMPP, database `inventaris_laboratorium`      |
| Akses DB | `mysql2/promise` dengan SQL manual dan prepared statement (tanpa ORM) |

## Prasyarat

- Node.js 20 LTS atau lebih baru (disarankan sesuai versi yang terpasang di mesin developer, `node -v`).
- npm (satu paket dengan Node.js).
- XAMPP dengan Apache dan MySQL aktif (dipakai untuk MySQL/phpMyAdmin, bukan untuk hosting backend/frontend).
- Port `3000` (backend) dan `3001` (frontend) belum dipakai proses lain.

## Struktur Folder

```
labinventory/
├── backend/          # REST API Express + TypeScript
├── frontend/          # Aplikasi Next.js App Router + TypeScript
├── database/          # inventaris.sql (skema dan seed untuk XAMPP)
├── dokumentasi/        # API.md dan DEMO.md (disusun pada tahap akhir)
└── README.md
```

## Urutan Instalasi

1. Aktifkan Apache dan MySQL pada XAMPP.
2. Buka phpMyAdmin dan impor `database/inventaris.sql` (tersedia mulai Tahap 2).
3. Salin `backend/.env.example` menjadi `backend/.env`, lalu sesuaikan nilainya
   (khususnya `JWT_SECRET` minimal 32 karakter dan kredensial MySQL lokal).
4. Masuk ke folder `backend`, jalankan `npm install` lalu `npm run dev`.
5. Salin `frontend/.env.local.example` menjadi `frontend/.env.local`.
6. Masuk ke folder `frontend`, jalankan `npm install` lalu `npm run dev`.
7. Buka `http://localhost:3001` di browser. Akun demo akan tersedia setelah database
   seed (Tahap 2) diimpor.

## Menjalankan Proyek

### Backend (port 3000)

```bash
cd backend
npm install
npm run dev      # mode development (tsx watch)
npm run build     # kompilasi TypeScript ke dist/
npm run start     # menjalankan hasil build
npm run lint      # ESLint
npm test          # Jest
```

Endpoint pemeriksaan kesehatan: `GET http://localhost:3000/api/health`

### Frontend (port 3001)

```bash
cd frontend
npm install
npm run dev      # mode development
npm run build     # build produksi
npm run start     # menjalankan hasil build
npm run lint      # ESLint
```

## Environment

Lihat `backend/.env.example` dan `frontend/.env.local.example` untuk daftar lengkap
variabel yang dibutuhkan. Jangan pernah melakukan commit file `.env`/`.env.local` yang
berisi nilai asli.

## Akun Demo

Akun demo (admin, operator, viewer) beserta password awal akan tersedia setelah
`database/inventaris.sql` diimpor pada Tahap 2. Detail lengkap didokumentasikan pada
`Invetaris_prd.pdf` bagian 6.4 dan akan disalin ke sini pada tahap finalisasi.

## Dokumentasi Lanjutan

Dokumentasi kontrak API (`dokumentasi/API.md`) dan urutan demo ujian
(`dokumentasi/DEMO.md`) disusun pada Tahap 10 (QA final) setelah seluruh fitur selesai.
