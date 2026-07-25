# Skenario Demo LabInventory (8–12 Menit)

Panduan urutan demonstrasi di depan penguji. Total waktu **±10 menit** dengan cadangan 2 menit untuk tanya jawab spontan.

---

## Persiapan Sebelum Masuk Ruangan (jangan dihitung waktu demo)

Lakukan **10 menit sebelum** demo:

1. **Impor ulang basis data** agar data bersih dan tidak ada sisa percobaan:
   ```bash
   "C:/xampp/mysql/bin/mysql" -u root < "database/inventaris.sql"
   ```
2. **Jalankan backend** di terminal 1: `cd backend && npm run dev`
   → tunggu sampai muncul `Koneksi database berhasil ...`
3. **Jalankan frontend** di terminal 2: `cd frontend && npm run dev`
4. **Buka tab browser** yang dibutuhkan:
   - Tab 1: `http://localhost:3001/login` (jangan login dulu)
   - Tab 2: `http://localhost/phpmyadmin` → basis data `inventaris_laboratorium`
   - Tab 3: editor kode, sudah membuka `backend/src/repository/barang.repository.ts`
5. **Siapkan satu berkas foto** JPG/PNG kecil (< 2 MB) di desktop, dan **satu berkas PDF** untuk demo penolakan berkas.
6. **Jangan login berulang kali saat latihan** — ada rate limit 10 percobaan per 15 menit. Bila terlanjur kena, restart backend.

> ⚠️ Jangan menjalankan `npm test` tepat sebelum demo — pengujian menambah baris log aktivitas. Bila terlanjur, impor ulang SQL.

---

## Urutan Demo

### 1 · Pembukaan & Masalah (0:00 – 0:45)

Tampilkan halaman login.

> "Selamat siang. Saya akan mendemonstrasikan LabInventory, sistem inventaris laboratorium komputer. Masalahnya sederhana: pendataan perangkat lab biasanya tersebar di beberapa spreadsheet, sehingga jumlah tidak akurat, kerusakan baru ketahuan saat praktikum, dan tidak ada catatan siapa mengubah apa. Sistem ini menyatukan ketiganya."

Tunjuk singkat tiga poin di panel kiri halaman login.

---

### 2 · Login sebagai Admin & Dashboard (0:45 – 2:15)

1. Login `admin@uai.ac.id` / `admin12345`.
2. Setelah masuk dashboard, jelaskan kartu statistik:
   > "Total barang, total kategori, kondisi baik, dan perlu perhatian. Angka 'perlu perhatian' adalah gabungan kondisi Perlu Perawatan dan Rusak — inilah yang dipakai untuk menjadwalkan perawatan."
3. Tunjuk grafik distribusi kondisi dan kategori, lalu daftar barang terbaru.
4. **Tunjukkan sidebar dapat diciutkan** — klik "Ciutkan Sidebar", tunjukkan menu menjadi ikon saja, lalu kembalikan.

> Kalimat kunci: *"Statusnya tersimpan, jadi kalau saya refresh, sidebar tetap dalam posisi terakhir."*

---

### 3 · Inventaris: Search, Filter, Pagination (2:15 – 3:45)

Masuk menu **Inventaris Barang**.

1. **Search**: ketik `proyektor` → tabel menyaring.
   > "Pencarian mencakup kode maupun nama barang, dan tidak membedakan huruf besar-kecil."
2. **Filter**: kosongkan pencarian, pilih Kondisi = **Rusak** → hanya barang rusak tampil.
3. **Tunjukkan URL di address bar** yang ikut berubah.
   > "Filter tersimpan di URL, jadi hasil pencarian ini bisa saya kirim ke rekan atau saya refresh tanpa kehilangan konteks."
4. **Pagination**: kembalikan filter ke semua, ubah urutan (sort) sekali, tunjukkan tombol Sebelumnya/Berikutnya.

---

### 4 · CRUD Barang + Upload Foto (3:45 – 5:30)

1. Klik **Tambah Barang**, isi:
   - Kode `PC-011`, Nama `PC Desktop Demo`, Kategori `Komputer`, Kondisi `Baik`, Lokasi `Lab Komputer 1`, Jumlah `5`
   - Unggah foto yang sudah disiapkan → tunjukkan pratinjaunya muncul.
2. Simpan → toast sukses, barang muncul di tabel lengkap dengan fotonya.
3. **Tunjukkan bukti di phpMyAdmin** (Tab 2): buka tabel `barang`, tunjuk kolom `foto`.
   > "Perhatikan nama berkasnya bukan nama file asli saya, melainkan nama acak yang dibuat server. Ini mencegah pengguna menentukan sendiri nama berkas di server."
4. **Edit** barang tadi, ganti kondisi menjadi `Perlu Perawatan` dan ganti fotonya.
   > "Saat foto diganti, berkas lama otomatis dihapus dari server — jadi tidak ada file menumpuk tanpa pemilik. Penghapusan baru dijalankan setelah update database berhasil, supaya kalau database gagal, fotonya tidak keburu hilang."
5. **Hapus** barang tadi → konfirmasi → hilang dari tabel dan berkas fotonya ikut terhapus.

---

### 5 · Validasi & Penanganan Error (5:30 – 6:45)

Ini bagian yang paling sering ditanya penguji — tunjukkan sistem **menolak dengan benar**, bukan hanya berhasil.

1. **Duplikat (409):** Tambah Barang dengan kode `PC-008` (sudah ada) → muncul pesan kode sudah dipakai.
2. **Berkas tidak valid (400):** Tambah Barang, unggah **berkas PDF** → ditolak dengan pesan jelas.
3. **Relasi terpakai (409):** buka **Kategori Barang**, coba hapus kategori **Komputer** →
   > *"Kategori "Komputer" masih dipakai oleh 3 barang dan tidak dapat dihapus."*

   > "Ini dijaga dua lapis: pengecekan di kode, dan `FOREIGN KEY ON DELETE RESTRICT` di basis data. Jadi walaupun ada yang memanggil API langsung, database tetap menolak."

---

### 6 · Manajemen User & Reset Password (6:45 – 8:00)

Masuk menu **Manajemen User**.

1. **Tunjukkan baris "Admin (Anda)"** — hanya ada tombol Edit dan Reset, **tidak ada tombol Hapus**.
   > "Admin tidak bisa menghapus akunnya sendiri. Ini dicegah di tampilan, dan tetap ditolak backend dengan status 409 kalau dicoba lewat API langsung — jadi bukan sekadar tombol yang disembunyikan."
2. **Tambah pengguna** baru dengan role `operator`.
3. **Reset password** pengguna tersebut → toast sukses.
   > "Tidak ada alur email palsu di sini. Reset dilakukan langsung oleh admin, dan responsnya tidak pernah memuat password maupun token."

---

### 7 · Pembuktian Role: Login sebagai Operator dan Viewer (8:00 – 9:30)

Ini bagian pembuktian paling kuat. **Gunakan jendela penyamaran (incognito)** agar sesi admin tidak hilang.

1. **Logout / buka incognito**, login `staff@uai.ac.id` / `staff12345` (operator):
   - Tunjukkan sidebar: **tidak ada** Manajemen User dan Aktivitas Sistem.
   - Buka **Kategori Barang**: tombol Tambah dan Edit ada, **tombol Hapus tidak ada**.
   - **Ketik manual** `localhost:3001/manajemen-user` di address bar → muncul halaman **403 Akses Ditolak**.
     > "Menyembunyikan menu bukan keamanannya. Route guard menahan di frontend, dan endpoint-nya sendiri tetap membalas 403 di backend."

2. Login `nafiazka2003@gmail.com` / `Nafi12345` (viewer):
   - Sidebar hanya berisi Dashboard, Inventaris Barang, dan Profil.
   - Di Inventaris: **tidak ada** tombol Tambah/Edit/Hapus — hanya bisa melihat.

---

### 8 · Aktivitas Sistem & Penutup (9:30 – 10:30)

Kembali ke jendela admin, masuk **Aktivitas Sistem**.

1. Tunjukkan bahwa **seluruh aksi barusan tercatat**: LOGIN operator, LOGIN viewer, CREATE barang, UPDATE barang, DELETE barang, CREATE user, RESET_PASSWORD — lengkap dengan pelaku, waktu, dan detail.
2. Gunakan filter Aksi = `DELETE` untuk mempersempit.

Penutup:

> "Seluruh akses basis data di sistem ini ditulis sebagai SQL manual dengan prepared statement lewat `mysql2` — tanpa ORM sama sekali. Backend juga punya 65 pengujian otomatis yang berjalan terhadap database MySQL sungguhan, mencakup matriks role, konflik data, dan siklus hidup berkas upload. Terima kasih, saya siap menerima pertanyaan."

---

## Bila Waktu Tersisa: Tunjukkan Kode (opsional, 1–2 menit)

Buka Tab 3 (`backend/src/repository/barang.repository.ts`) dan tunjuk dua hal:

1. **Prepared statement** — nilai dari pengguna selalu lewat `?`:
   ```ts
   klausa.push(`(${prefixKolom}kode_barang LIKE ? OR ${prefixKolom}nama_barang LIKE ?)`);
   nilai.push(kataKunci, kataKunci);
   ```
2. **Whitelist ORDER BY** — karena nama kolom tidak bisa memakai `?`:
   ```ts
   export const KOLOM_SORT_BARANG = ["kode_barang", "nama_barang", "kondisi", ...] as const;
   ```
   > "Nama kolom tidak bisa jadi placeholder di SQL, jadi satu-satunya cara aman adalah membatasinya ke daftar tetap. Nilai di luar daftar ditolak 422."

Bila diminta bukti pengujian, jalankan `npm test` di folder `backend`.

---

## Rencana Cadangan Bila Ada Masalah

| Masalah saat demo | Tindakan cepat |
| :--- | :--- |
| Backend mati / data tidak muncul | Cek terminal 1; jalankan ulang `npm run dev` |
| `429 Terlalu banyak percobaan login` | Restart backend (penghitung ada di memori), jangan menunggu 15 menit |
| Data berantakan karena salah klik | Impor ulang SQL, refresh browser — butuh ±10 detik |
| Foto tidak tampil | Pastikan backend hidup di port 3000; foto disajikan dari `/uploads/barang/` |
| Lupa logout dari admin | Buka jendela incognito untuk role lain |

---

## Ringkasan Waktu

| Bagian | Durasi | Kumulatif |
| :--- | :---: | :---: |
| 1. Pembukaan & masalah | 0:45 | 0:45 |
| 2. Login admin & dashboard | 1:30 | 2:15 |
| 3. Search, filter, pagination | 1:30 | 3:45 |
| 4. CRUD barang + upload foto | 1:45 | 5:30 |
| 5. Validasi & error | 1:15 | 6:45 |
| 6. Manajemen user & reset password | 1:15 | 8:00 |
| 7. Pembuktian role operator & viewer | 1:30 | 9:30 |
| 8. Aktivitas sistem & penutup | 1:00 | 10:30 |
| *(opsional)* Tinjauan kode | 1:30 | 12:00 |
