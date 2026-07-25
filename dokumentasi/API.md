# Dokumentasi REST API — LabInventory

**Base URL:** `http://localhost:3000/api`
**Berkas statis foto:** `http://localhost:3000/uploads/barang/<nama-berkas>`

---

## 1. Kontrak Umum

### Format respons

Seluruh endpoint memakai amplop respons yang sama.

**Sukses**
```json
{
  "sukses": true,
  "pesan": "Daftar barang berhasil diambil.",
  "data": [],
  "meta": { "halaman": 1, "batas": 10, "totalData": 10, "totalHalaman": 1 }
}
```
`meta` hanya muncul pada endpoint berpaginasi. `data` bernilai `null` bila endpoint tidak mengembalikan isi.

**Gagal**
```json
{
  "sukses": false,
  "pesan": "Data yang dikirim tidak valid.",
  "kesalahan": [{ "field": "email", "pesan": "Format email tidak valid." }]
}
```
`kesalahan` hanya muncul pada kegagalan validasi (422).

### Autentikasi

Setelah login berhasil, server memasang cookie **`access_token`** dengan atribut `HttpOnly`, `SameSite=Lax`, dan `Path=/`. Browser mengirimkannya otomatis selama request memakai `credentials: "include"`.

Untuk pengujian lewat Postman/curl, token juga diterima melalui header:

```http
Authorization: Bearer <token>
```

### Role

| Label | Arti |
| :--- | :--- |
| `publik` | Tidak perlu login |
| `login` | Semua role yang sudah login (admin, operator, viewer) |
| `admin` | Hanya admin |
| `admin, operator` | Admin dan operator |

### Kode status yang dipakai

| Kode | Kapan muncul |
| :---: | :--- |
| `200` | Berhasil |
| `201` | Sumber daya baru dibuat |
| `400` | Berkas unggahan tidak valid (mis. PDF/executable) |
| `401` | Belum login, token rusak, atau token kedaluwarsa |
| `403` | Sudah login tetapi role tidak berwenang |
| `404` | Data atau endpoint tidak ditemukan |
| `409` | Konflik data (duplikat, relasi masih dipakai, aturan bisnis) |
| `413` | Ukuran berkas melebihi `UPLOAD_MAX_MB` (bawaan 2 MB) |
| `422` | Body/query/param gagal validasi |
| `429` | Melebihi rate limit login (10 percobaan / 15 menit / IP) |
| `500` | Kesalahan tak terduga — pesan generik, tanpa stack trace |

---

## 2. Ringkasan Seluruh Endpoint

| Metode | Endpoint | Role | Fungsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | publik | Cek server hidup |
| `POST` | `/auth/register` | publik | Daftar akun baru (selalu viewer) |
| `POST` | `/auth/login` | publik | Login, memasang cookie JWT |
| `GET` | `/auth/me` | login | Data pengguna aktif |
| `POST` | `/auth/logout` | login | Hapus cookie JWT |
| `GET` | `/dashboard` | login | Statistik ringkasan |
| `GET` | `/barang` | login | Daftar barang (search/filter/sort/pagination) |
| `GET` | `/barang/opsi-lokasi` | login | Daftar lokasi unik untuk dropdown filter |
| `GET` | `/barang/:id` | login | Detail satu barang |
| `POST` | `/barang` | admin, operator | Tambah barang (opsional dengan foto) |
| `PUT` | `/barang/:id` | admin, operator | Ubah barang (opsional ganti foto) |
| `DELETE` | `/barang/:id` | admin | Hapus barang beserta fotonya |
| `GET` | `/kategori` | admin, operator | Daftar kategori + jumlah barang |
| `POST` | `/kategori` | admin, operator | Tambah kategori |
| `PUT` | `/kategori/:id` | admin, operator | Ubah kategori |
| `DELETE` | `/kategori/:id` | admin | Hapus kategori (bila tidak dipakai) |
| `GET` | `/users` | admin | Daftar pengguna (search/filter/pagination) |
| `GET` | `/users/:id` | admin | Detail pengguna |
| `POST` | `/users` | admin | Tambah pengguna |
| `PUT` | `/users/:id` | admin | Ubah nama/email/role |
| `DELETE` | `/users/:id` | admin | Hapus pengguna |
| `PATCH` | `/users/:id/reset-password` | admin | Reset password pengguna |
| `GET` | `/profil` | login | Profil sendiri |
| `PUT` | `/profil` | login | Ubah profil sendiri |
| `GET` | `/aktivitas` | admin | Log aktivitas sistem |

---

## 3. Kesehatan Server

### `GET /health` — publik

**Response `200`**
```json
{ "sukses": true, "pesan": "Server LabInventory berjalan normal.", "data": { "status": "ok", "waktu": "2026-07-25T02:00:00.000Z" } }
```

---

## 4. Autentikasi

### `POST /auth/register` — publik

Membuat akun baru. **Role selalu dipaksa `viewer`** di server, bahkan bila body mengirim `role` lain.

**Request**
```json
{ "nama": "Budi Santoso", "email": "budi@uai.ac.id", "password": "budi12345", "konfirmasiPassword": "budi12345" }
```

| Field | Aturan |
| :--- | :--- |
| `nama` | wajib, 3–120 karakter |
| `email` | wajib, format email, otomatis dijadikan huruf kecil, harus unik |
| `password` | wajib, minimal 8 karakter, mengandung huruf **dan** angka |
| `konfirmasiPassword` | wajib sama dengan `password` |

**Response `201`**
```json
{ "sukses": true, "pesan": "Registrasi berhasil. Silakan login.", "data": { "id": 4, "nama": "Budi Santoso", "email": "budi@uai.ac.id", "role": "viewer", "created_at": "2026-07-25 09:00:00", "updated_at": "2026-07-25 09:00:00" } }
```

| Status | Penyebab |
| :---: | :--- |
| `409` | Email sudah terdaftar |
| `422` | Validasi gagal (nama/email/password/konfirmasi) |

---

### `POST /auth/login` — publik

**Request**
```json
{ "email": "admin@uai.ac.id", "password": "admin12345", "ingatSaya": false }
```

`ingatSaya` opsional (boolean). Bila `true`, masa berlaku token menjadi `JWT_EXPIRES_IN_INGAT_SAYA` (bawaan `7d`), bila tidak `JWT_EXPIRES_IN` (bawaan `8h`).

**Response `200`** — sekaligus memasang cookie `access_token`
```json
{ "sukses": true, "pesan": "Selamat datang, Admin.", "data": { "id": 1, "nama": "Admin", "email": "admin@uai.ac.id", "role": "admin", "created_at": "...", "updated_at": "..." } }
```

| Status | Penyebab |
| :---: | :--- |
| `401` | Email **atau** password salah — pesan sengaja dibuat sama ("Email atau password salah.") agar tidak membocorkan email mana yang terdaftar |
| `422` | Format email tidak valid atau password kosong |
| `429` | Lebih dari 10 percobaan dalam 15 menit dari satu IP |

---

### `GET /auth/me` — login

**Response `200`**
```json
{ "sukses": true, "pesan": "Data pengguna aktif.", "data": { "id": 1, "nama": "Admin", "email": "admin@uai.ac.id", "role": "admin", "created_at": "...", "updated_at": "..." } }
```

`401` bila tidak ada cookie/header, token rusak, token kedaluwarsa, atau akun sudah dihapus.

---

### `POST /auth/logout` — login

Menghapus cookie `access_token`.

**Response `200`**
```json
{ "sukses": true, "pesan": "Logout berhasil.", "data": null }
```

---

## 5. Dashboard

### `GET /dashboard` — login (semua role)

**Response `200`**
```json
{
  "sukses": true,
  "pesan": "Ringkasan dashboard berhasil diambil.",
  "data": {
    "totalBarang": 10,
    "totalKategori": 6,
    "kondisiBaik": 6,
    "perluPerhatian": 3,
    "distribusiKondisi": [
      { "kondisi": "Baik", "total": 6 },
      { "kondisi": "Perlu Perawatan", "total": 2 },
      { "kondisi": "Rusak", "total": 1 },
      { "kondisi": "Tidak Aktif", "total": 1 }
    ],
    "distribusiKategori": [{ "kategori": "Komputer", "total": 3 }],
    "barangTerbaru": [],
    "daftarPerluPerhatian": []
  }
}
```

`perluPerhatian` = jumlah barang berkondisi **Perlu Perawatan** + **Rusak**. `distribusiKondisi` selalu memuat keempat kondisi walaupun totalnya `0`.

---

## 6. Barang

### `GET /barang` — login

**Query parameter** (semua opsional)

| Parameter | Tipe | Aturan | Bawaan |
| :--- | :--- | :--- | :--- |
| `page` | integer | ≥ 1 | `1` |
| `limit` | integer | 1–100 | `10` |
| `search` | string | maks 160 karakter; mencocokkan `kode_barang` **atau** `nama_barang` | – |
| `kategori_id` | integer | ≥ 1 | – |
| `kondisi` | enum | `Baik` \| `Perlu Perawatan` \| `Rusak` \| `Tidak Aktif` | – |
| `lokasi` | string | maks 120 karakter, cocok persis | – |
| `sort` | enum | `kode_barang`, `nama_barang`, `kondisi`, `lokasi`, `jumlah`, `created_at`, `updated_at` | `created_at` |
| `order` | enum | `asc` \| `desc` | `desc` |

> `sort` dibatasi **whitelist**, karena nama kolom tidak dapat memakai placeholder `?` pada SQL. Nilai di luar daftar ditolak `422`.

Contoh: `GET /barang?search=proyektor&kondisi=Rusak&page=1&limit=10&sort=nama_barang&order=asc`

**Response `200`**
```json
{
  "sukses": true,
  "pesan": "Daftar barang berhasil diambil.",
  "data": [
    {
      "id": 8, "kode_barang": "PRJ-003", "nama_barang": "Proyektor Epson EB-X06",
      "kategori_id": 3, "nama_kategori": "Proyektor", "kondisi": "Rusak",
      "lokasi": "Lab Komputer 1", "jumlah": 2, "foto": "default-barang.png",
      "created_at": "2026-07-25 09:00:00", "updated_at": "2026-07-25 09:00:00"
    }
  ],
  "meta": { "halaman": 1, "batas": 10, "totalData": 1, "totalHalaman": 1 }
}
```

---

### `GET /barang/opsi-lokasi` — login

Daftar lokasi unik yang sedang dipakai, untuk mengisi dropdown filter.

**Response `200`**
```json
{ "sukses": true, "pesan": "Daftar lokasi berhasil diambil.", "data": ["Gudang Perangkat", "Lab Komputer 1", "Lab Komputer 2"] }
```

---

### `GET /barang/:id` — login

**Response `200`** — objek barang seperti pada daftar.
`404` bila id tidak ada, `422` bila id bukan angka.

---

### `POST /barang` — admin, operator

Menerima **`application/json`** (tanpa foto) atau **`multipart/form-data`** (dengan foto pada field `foto`).

| Field | Aturan |
| :--- | :--- |
| `kode_barang` | wajib, 2–50 karakter, hanya huruf/angka/tanda hubung, **unik** |
| `nama_barang` | wajib, 3–160 karakter |
| `kategori_id` | wajib, integer ≥ 1, kategori harus ada |
| `kondisi` | wajib, salah satu dari empat nilai enum |
| `lokasi` | wajib, 2–120 karakter |
| `jumlah` | wajib, integer 0–100000 |
| `foto` | opsional, berkas JPG/PNG/WebP maksimal 2 MB |

Bila `foto` tidak dikirim, nilai kolom `foto` diisi `default-barang.png`.

**Response `201`** — objek barang yang baru dibuat.

| Status | Penyebab |
| :---: | :--- |
| `400` | Berkas bukan gambar (mis. PDF atau executable) |
| `403` | Role viewer |
| `409` | `kode_barang` sudah dipakai |
| `413` | Ukuran foto melebihi 2 MB |
| `422` | Validasi field gagal, atau `kategori_id` tidak ada di basis data |

---

### `PUT /barang/:id` — admin, operator

Field sama dengan `POST`. Bila `foto` **tidak** dikirim, foto lama dipertahankan. Bila dikirim, foto baru disimpan lalu **berkas lama dihapus setelah transaksi database sukses**.

**Response `200`** — objek barang setelah diperbarui.
Status error sama dengan `POST`, ditambah `404` bila barang tidak ditemukan.

---

### `DELETE /barang/:id` — **admin**

Menghapus baris barang beserta berkas fotonya (kecuali `default-barang.png` yang dipakai bersama).

**Response `200`**
```json
{ "sukses": true, "pesan": "Barang berhasil dihapus.", "data": null }
```

`403` untuk operator/viewer, `404` bila tidak ditemukan.

---

## 7. Kategori

### `GET /kategori` — admin, operator

**Response `200`**
```json
{
  "sukses": true,
  "pesan": "Daftar kategori berhasil diambil.",
  "data": [
    { "id": 1, "nama_kategori": "Komputer", "deskripsi": "Komputer desktop, workstation, dan server laboratorium.", "jumlah_barang": 3, "created_at": "...", "updated_at": "..." }
  ]
}
```

`jumlah_barang` dihitung lewat `LEFT JOIN` agar frontend tidak perlu query tambahan.
`403` untuk viewer — termasuk untuk `GET`.

---

### `POST /kategori` — admin, operator

**Request**
```json
{ "nama_kategori": "Perangkat Audio", "deskripsi": "Speaker dan mikrofon laboratorium." }
```

| Field | Aturan |
| :--- | :--- |
| `nama_kategori` | wajib, 2–100 karakter, **unik** |
| `deskripsi` | opsional, maksimal 255 karakter |

**Response `201`** — objek kategori baru.
`409` bila nama sudah ada, `422` bila validasi gagal.

---

### `PUT /kategori/:id` — admin, operator

Field sama dengan `POST`. `200` bila berhasil, `404` bila tidak ada, `409` bila nama bentrok dengan kategori lain.

---

### `DELETE /kategori/:id` — **admin**

**Response `200`**
```json
{ "sukses": true, "pesan": "Kategori berhasil dihapus.", "data": null }
```

**Response `409`** bila masih dipakai barang:
```json
{ "sukses": false, "pesan": "Kategori \"Komputer\" masih dipakai oleh 3 barang dan tidak dapat dihapus." }
```

Dijaga ganda: pengecekan eksplisit di lapisan layanan **dan** `FOREIGN KEY ... ON DELETE RESTRICT` di basis data.

---

## 8. Manajemen User (admin)

### `GET /users` — admin

| Query | Aturan | Bawaan |
| :--- | :--- | :--- |
| `page` | integer ≥ 1 | `1` |
| `limit` | integer 1–100 | `10` |
| `search` | maks 160 karakter; mencocokkan nama **atau** email | – |
| `role` | `admin` \| `operator` \| `viewer` | – |

**Response `200`** — array `PenggunaAman` + `meta`. **Tidak pernah** memuat `password` atau `reset_token`.

---

### `GET /users/:id` — admin

`200` objek pengguna, `404` bila tidak ada.

---

### `POST /users` — admin

**Request**
```json
{ "nama": "Operator Lab 2", "email": "operator2@uai.ac.id", "password": "operator12345", "role": "operator" }
```

| Field | Aturan |
| :--- | :--- |
| `nama` | wajib, 3–120 karakter |
| `email` | wajib, format email, unik, otomatis huruf kecil |
| `password` | wajib, minimal 8 karakter, huruf **dan** angka |
| `role` | wajib, `admin` \| `operator` \| `viewer` |

`201` berhasil, `409` email sudah dipakai, `422` validasi gagal.

---

### `PUT /users/:id` — admin

**Request**
```json
{ "nama": "Operator Lab 2", "email": "operator2@uai.ac.id", "role": "viewer" }
```

Password **tidak** diubah lewat endpoint ini.

| Status | Penyebab |
| :---: | :--- |
| `404` | Pengguna tidak ada |
| `409` | Email dipakai pengguna lain, **atau** menurunkan role admin terakhir |
| `422` | Validasi gagal |

---

### `DELETE /users/:id` — admin

| Status | Penyebab |
| :---: | :--- |
| `200` | Berhasil |
| `404` | Pengguna tidak ada |
| `409` | Menghapus akun sendiri, atau menghapus admin terakhir |

Baris `aktivitas_sistem` milik pengguna yang dihapus tidak ikut hilang — `user_id` menjadi `NULL` (`ON DELETE SET NULL`) sehingga jejak audit tetap utuh.

---

### `PATCH /users/:id/reset-password` — admin

**Request**
```json
{ "passwordBaru": "passwordbaru123", "konfirmasiPassword": "passwordbaru123" }
```

**Response `200`**
```json
{ "sukses": true, "pesan": "Password pengguna berhasil direset.", "data": null }
```

Respons **tidak pernah** memuat password atau token. `422` bila password lemah atau konfirmasi tidak cocok, `404` bila pengguna tidak ada.

---

## 9. Profil

### `GET /profil` — login

Mengembalikan data pengguna yang sedang login.

### `PUT /profil` — login

**Request**
```json
{ "nama": "Muhammad Nafi", "email": "nafi@uai.ac.id" }
```

| Field | Aturan |
| :--- | :--- |
| `nama` | wajib, 3–120 karakter |
| `email` | opsional (kosong = tidak diubah), harus unik |

`role` **tidak dapat** diubah sendiri lewat endpoint ini — hanya admin yang boleh, melalui `PUT /users/:id`.

`200` berhasil, `409` email sudah dipakai pengguna lain, `422` validasi gagal.

---

## 10. Aktivitas Sistem

### `GET /aktivitas` — admin

| Query | Aturan | Bawaan |
| :--- | :--- | :--- |
| `page` | integer ≥ 1 | `1` |
| `limit` | integer 1–100 | `10` |
| `aksi` | `LOGIN` \| `CREATE` \| `UPDATE` \| `DELETE` \| `RESET_PASSWORD` | – |
| `entitas` | `auth` \| `kategori` \| `barang` \| `user` \| `profil` | – |

**Response `200`**
```json
{
  "sukses": true,
  "pesan": "Daftar aktivitas berhasil diambil.",
  "data": [
    {
      "id": 3, "user_id": 2, "nama_pengguna": "Staff Universitas", "email_pengguna": "staff@uai.ac.id",
      "aksi": "UPDATE", "entitas": "barang", "entitas_id": 3,
      "detail": "Memperbarui kondisi PC-003 menjadi Perlu Perawatan.",
      "ip_address": "127.0.0.1", "created_at": "2026-07-25 09:00:00"
    }
  ],
  "meta": { "halaman": 1, "batas": 10, "totalData": 3, "totalHalaman": 1 }
}
```

`nama_pengguna` dan `email_pengguna` bernilai `null` bila akun pelakunya sudah dihapus; frontend menampilkannya sebagai "Akun telah dihapus".

`403` untuk operator dan viewer.

---

## 11. Berkas Statis

### `GET /uploads/barang/<nama-berkas>` — publik

Menyajikan foto barang. Header `Cross-Origin-Resource-Policy: cross-origin` dipasang khusus di path ini agar `<img>` pada frontend (port 3001) dapat menampilkan gambar dari backend (port 3000). Endpoint `/api` tetap memakai kebijakan ketat bawaan Helmet.

`404` berformat JSON baku bila berkas tidak ada.

---

## 12. Contoh Pemakaian dengan curl

```bash
# Login, simpan cookie ke berkas
curl -c cookie.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@uai.ac.id","password":"admin12345"}'

# Memakai cookie tersebut
curl -b cookie.txt "http://localhost:3000/api/barang?limit=5&kondisi=Rusak"

# Tambah barang dengan foto (multipart)
curl -b cookie.txt -X POST http://localhost:3000/api/barang \
  -F "kode_barang=PC-011" -F "nama_barang=PC Desktop Baru" \
  -F "kategori_id=1" -F "kondisi=Baik" -F "lokasi=Lab Komputer 1" \
  -F "jumlah=5" -F "foto=@./foto.png"

# Logout
curl -b cookie.txt -X POST http://localhost:3000/api/auth/logout
```
