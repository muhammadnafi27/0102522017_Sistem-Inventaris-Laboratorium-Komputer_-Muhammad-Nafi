# Konsep Teknis LabInventory

Penjelasan singkat mekanisme inti sistem, disertai kutipan kode yang benar-benar dipakai, dan diakhiri daftar pertanyaan yang mungkin diajukan penguji beserta jawaban jujurnya.

---

## 1. Prepared Statement (dan Mengapa Tanpa ORM)

**Masalah yang dicegah:** SQL injection. Bila input pengguna disambung langsung ke string SQL, mengetik `' OR '1'='1` di kolom pencarian bisa mengubah arti query.

**Cara sistem ini bekerja:** nilai dari pengguna **tidak pernah** masuk ke teks SQL. Yang ditulis di SQL hanya tanda tanya `?`; nilainya dikirim terpisah sebagai array. Server MySQL menerima struktur query dan datanya sebagai dua hal berbeda, sehingga data tidak mungkin dibaca sebagai perintah.

```ts
// backend/src/repository/barang.repository.ts
if (filter.search) {
  klausa.push(`(${prefixKolom}kode_barang LIKE ? OR ${prefixKolom}nama_barang LIKE ?)`);
  const kataKunci = `%${filter.search}%`;
  nilai.push(kataKunci, kataKunci);       // nilai dikirim terpisah
}
// ...
await konektor.execute(sql, [...nilai, opsi.batas, offset]);
```

Perhatikan `${prefixKolom}` di dalam template string. Itu **bukan** input pengguna — isinya konstanta internal `"b."` atau `""`, dipakai supaya nama kolom tidak ambigu saat query memakai `JOIN`.

**Pengecualian yang tidak bisa dihindari — `ORDER BY`.** Nama kolom tidak boleh memakai placeholder `?` di SQL. Karena itu kolom pengurutan dibatasi **whitelist**:

```ts
export const KOLOM_SORT_BARANG = [
  "kode_barang", "nama_barang", "kondisi", "lokasi", "jumlah", "created_at", "updated_at",
] as const;
```

Whitelist ini ditegakkan tiga lapis: `express-validator` (`.isIn(KOLOM_SORT_BARANG)` → tolak `422`), fungsi `pastikanKolomSort()` di lapisan layanan yang jatuh ke nilai bawaan bila tidak cocok, dan tipe TypeScript `KolomSortBarang` di repository.

**Mengapa tanpa ORM?** Ini persyaratan tugas, tetapi ada manfaat nyatanya: seluruh SQL terkumpul di satu folder `repository/`, sehingga saat memeriksa keamanan query cukup membaca empat berkas. Konsekuensinya, penulisan query lebih panjang dan pemetaan hasil ke tipe dilakukan manual.

---

## 2. JWT (JSON Web Token)

JWT adalah token bertanda tangan berisi tiga bagian: *header*, *payload*, dan *signature*. Server tidak menyimpan sesi di memori — cukup memverifikasi tanda tangannya.

**Payload sengaja dibuat minimal:**

```ts
export interface PayloadToken {
  sub: number;        // id pengguna
  email: string;
  role: RolePengguna;
}
```

> **Penting dan sering salah dipahami:** JWT hanya di-*encode* Base64, **bukan dienkripsi**. Siapa pun yang memegang token bisa membaca isinya. Karena itu tidak ada password atau data sensitif di dalam payload. Yang dijamin JWT adalah *keaslian* (isi tidak diubah tanpa ketahuan), bukan *kerahasiaan*.

**Masa berlaku:** 8 jam normal, 7 hari bila "Ingat saya" dicentang (`JWT_EXPIRES_IN` / `JWT_EXPIRES_IN_INGAT_SAYA`).

**Role dibaca ulang dari database setiap request**, bukan diambil dari token:

```ts
// backend/src/middleware/autentikasi.ts
const payload = verifikasiToken(token);
const baris = await usersRepository.cariById(payload.sub);   // ← baca ulang dari DB
if (!baris) throw new KesalahanAplikasi(401, "Akun tidak ditemukan atau telah dihapus.");
req.pengguna = { id: baris.id, nama: baris.nama, email: baris.email, role: baris.role };
```

Alasannya: JWT tidak bisa dicabut sebelum kedaluwarsa. Bila admin menurunkan role seseorang dari `admin` ke `viewer`, token lamanya masih valid selama 8 jam. Dengan membaca ulang dari basis data, perubahan role langsung berlaku dan akun yang sudah dihapus langsung ditolak. Biayanya satu query ringan berdasarkan *primary key* per request.

---

## 3. bcrypt

Password **tidak pernah** disimpan sebagai teks asli. Yang disimpan adalah hash bcrypt cost 10:

```
$2b$10$UOzwu7IxdlKaFxtZ32IRr.Ouw3fXv07TyIlQ7hTen.GxC2yNzVKb2
 │   │  └─ salt (22 karakter) + hash
 │   └──── cost factor 10 → 2¹⁰ = 1024 putaran
 └──────── varian algoritma
```

Tiga sifat pentingnya:

1. **Satu arah.** Hash tidak bisa dikembalikan menjadi password. Verifikasi login dilakukan dengan `bcrypt.compare(passwordKetikan, hashTersimpan)` — bukan dengan membandingkan hash secara langsung.
2. **Ada salt acak** yang otomatis dibuat dan ikut tersimpan di dalam string hash. Dua pengguna dengan password identik menghasilkan hash berbeda, sehingga *rainbow table* tidak berguna.
3. **Sengaja lambat.** Cost 10 membuat satu verifikasi memakan ±70–130 ms. Untuk satu login itu tidak terasa, tetapi membuat penebakan jutaan password menjadi tidak praktis. (Angka ±70 ms ini terlihat nyata di log pengujian pada baris `POST /api/auth/login`.)

Ditambah dua hal lain: pesan gagal login sengaja **sama** untuk email salah maupun password salah (`"Email atau password salah."`) supaya penyerang tidak bisa menyimpulkan email mana yang terdaftar, dan endpoint login dibatasi 10 percobaan per 15 menit per IP.

---

## 4. CORS dan Cookie Lintas Origin

Frontend berjalan di `localhost:3001`, backend di `localhost:3000`. Bagi browser, **beda port = beda origin**, sehingga berlaku aturan CORS.

**Sisi backend** — hanya origin frontend yang diizinkan, dan cookie diizinkan ikut:

```ts
aplikasi.use(cors({ origin: environment.frontendUrl, credentials: true }));
```

`credentials: true` inilah yang membuat browser mau mengirim dan menerima cookie lintas origin. Perlu dicatat: dengan `credentials: true`, `origin` **tidak boleh** `"*"` — spesifikasi CORS melarangnya, jadi origin memang harus disebut eksplisit.

**Sisi frontend** — setiap fetch wajib menyertakan kredensial:

```ts
// frontend/src/layanan-api/klien.ts
respons = await fetch(url, { method, credentials: "include", headers, body });
```

**Atribut cookie:**

```ts
{ httpOnly: true, sameSite: "lax", secure: environment.isProduction, path: "/" }
```

| Atribut | Alasan |
| :--- | :--- |
| `httpOnly: true` | JavaScript tidak bisa membaca cookie → token aman dari pencurian lewat XSS |
| `sameSite: "lax"` | Cookie tidak ikut terkirim pada request lintas situs berisiko → meredam CSRF |
| `secure` hanya di produksi | Di localhost belum ada HTTPS; memaksa `secure` justru membuat cookie tidak pernah terpasang saat pengembangan |

**Mengapa cookie, bukan localStorage?** Token di `localStorage` bisa dibaca skrip apa pun di halaman — satu celah XSS berarti token tercuri. Cookie `HttpOnly` tidak bisa disentuh JavaScript. Konsekuensinya muncul risiko CSRF, yang ditekan dengan `SameSite=Lax` dan CORS yang membatasi origin.

**Satu jebakan yang sempat terjadi di proyek ini:** `helmet()` secara bawaan memasang `Cross-Origin-Resource-Policy: same-origin`, sehingga `<img>` di port 3001 diblokir browser saat memuat foto dari port 3000 (`ERR_BLOCKED_BY_RESPONSE.NotSameOrigin`) — gambar diam-diam gagal tanpa pesan error. Perbaikannya melonggarkan kebijakan itu **hanya** untuk folder gambar publik:

```ts
aplikasi.use("/uploads", helmet.crossOriginResourcePolicy({ policy: "cross-origin" }), express.static("unggahan"));
```

Endpoint `/api` tetap memakai kebijakan ketat bawaan Helmet, dan perilaku ini dikunci oleh pengujian `tes/berkas-statis.test.ts`.

---

## 5. Middleware Role

Otorisasi ditulis sebagai *higher-order function* yang mengembalikan middleware:

```ts
// backend/src/middleware/otorisasi.ts
export function authorizeRoles(...roles: RolePengguna[]) {
  return (req, _res, next) => {
    if (!req.pengguna) return next(new KesalahanAplikasi(401, "Anda belum login."));
    if (!roles.includes(req.pengguna.role))
      return next(new KesalahanAplikasi(403, "Anda tidak memiliki akses untuk aksi ini."));
    next();
  };
}
```

Pemakaiannya deklaratif di berkas rute:

```ts
rute.use(autentikasi);                                   // semua endpoint barang wajib login
rute.get("/", ..., barangController.daftar);             // semua role boleh membaca
rute.post("/", authorizeRoles("admin", "operator"), ...); // hanya admin & operator
rute.delete("/:id", authorizeRoles("admin"), ...);       // hanya admin
```

Urutannya wajib `autentikasi` → `authorizeRoles`, karena `authorizeRoles` membaca `req.pengguna` yang baru diisi oleh `autentikasi`.

**Perbedaan 401 dan 403:** `401` = "saya tidak tahu Anda siapa" (belum login / token bermasalah). `403` = "saya tahu Anda siapa, tetapi Anda tidak berwenang".

**Frontend punya penjagaan sendiri**, tetapi itu hanya kenyamanan, bukan keamanan: menu difilter berdasarkan role dan `RoleGuard` menampilkan halaman 403 yang rapi bila URL diketik manual. Pengaman sebenarnya tetap di backend — memanggil `GET /api/users` sebagai viewer tetap dibalas `403` meskipun tidak ada tombolnya di layar.

---

## 6. Siklus Hidup Upload Foto

**Saat berkas masuk** (`backend/src/middleware/unggah.ts`):

1. `fileFilter` memeriksa MIME type terhadap whitelist `image/jpeg`, `image/png`, `image/webp`. Berkas lain ditolak **sebelum satu byte pun ditulis ke disk** → `400`.
2. `limits.fileSize` menolak berkas melebihi `UPLOAD_MAX_MB` (bawaan 2 MB) → `413`.
3. Nama berkas dibuat ulang oleh server, **tidak pernah** memakai nama kiriman client:

```ts
const namaUnik = `barang-${crypto.randomBytes(16).toString("hex")}${EKSTENSI_PER_MIME[file.mimetype]}`;
```

Ini mencegah dua hal sekaligus: *path traversal* (nama seperti `../../src/server.ts`) dan penyamaran berkas berbahaya (`virus.jpg.exe`). Ekstensi diambil dari **hasil deteksi MIME**, bukan dari nama file asli.

**Saat data berubah** — urutan operasinya penting:

| Kejadian | Urutan yang dijalankan |
| :--- | :--- |
| **Create tanpa foto** | Kolom `foto` diisi `default-barang.png` |
| **Create dengan foto** | Simpan berkas → simpan baris. Bila penyimpanan baris gagal, berkas yang sudah terunggah **dibersihkan** |
| **Update ganti foto** | Simpan berkas baru → update baris di database → **baru** hapus berkas lama |
| **Update tanpa foto** | Nilai `foto` lama dipertahankan apa adanya |
| **Delete barang** | Hapus baris → hapus berkas fotonya |

Penghapusan berkas lama sengaja dilakukan **setelah** transaksi database sukses. Bila urutannya dibalik dan database gagal, foto sudah terlanjur hilang padahal barisnya masih menunjuk ke sana.

`hapusFotoBarang()` juga punya dua pengaman: tidak pernah menghapus `default-barang.png` (dipakai bersama banyak barang), dan tidak melempar error bila berkasnya memang sudah tidak ada (`ENOENT`).

**Bukti pengujian:** berkas `tes/unggah-dashboard.test.ts` memverifikasi berkas lama benar-benar hilang dari disk setelah update, penolakan PDF (400), penolakan ukuran berlebih (413), dan pembersihan berkas ketika validasi lain gagal. Pengujian browser terpisah membuktikan folder unggahan berisi jumlah berkas yang **persis sama** sebelum dan sesudah siklus create → update → delete.

---

## 7. Pagination di SQL

Pagination dikerjakan **di basis data**, bukan dengan mengambil semua baris lalu memotongnya di JavaScript. Untuk 10 baris memang tidak terasa bedanya; untuk 10.000 baris, memotong di JavaScript berarti mengirim semuanya lewat jaringan setiap kali.

```sql
SELECT b.*, k.nama_kategori
FROM barang b
JOIN kategori_barang k ON k.id = b.kategori_id
WHERE ...
ORDER BY b.<kolom-whitelist> <ASC|DESC>
LIMIT ? OFFSET ?
```

`offset` dihitung `(halaman - 1) * batas`. Jadi halaman 3 dengan `limit` 10 → `LIMIT 10 OFFSET 20`.

Dibutuhkan **dua query** yang dijalankan bersamaan lewat `Promise.all`: satu mengambil data halaman ini, satu lagi `COUNT(*)` dengan klausa `WHERE` yang sama untuk menghitung `totalData`. Tanpa `COUNT`, frontend tidak bisa tahu ada berapa halaman.

```ts
const [baris, totalData] = await Promise.all([
  barangRepository.cariDenganFilter({ ...filter, halaman, batas, kolomSort, arahSort }),
  barangRepository.hitungDenganFilter(filter),
]);
```

Metanya dikembalikan seragam di seluruh endpoint berpaginasi:

```json
{ "halaman": 1, "batas": 10, "totalData": 42, "totalHalaman": 5 }
```

`limit` dibatasi maksimal 100 (`Math.min(BATAS_MAKSIMUM, ...)`) supaya seseorang tidak bisa meminta `?limit=999999` dan membebani server.

**Keterbatasan yang jujur:** `OFFSET` besar tetap lambat karena MySQL harus melewati baris satu per satu. Untuk data berjuta baris, pendekatan *keyset pagination* (`WHERE id < ? LIMIT 10`) lebih baik. Untuk skala satu laboratorium, `OFFSET` sudah lebih dari cukup.

---

## 8. Transaksi Database

Dipakai ketika beberapa perubahan harus berhasil semua atau gagal semua:

```ts
export async function jalankanTransaksi<T>(callback: (koneksi: PoolConnection) => Promise<T>): Promise<T> {
  const koneksi = await pool.getConnection();
  try {
    await koneksi.beginTransaction();
    const hasil = await callback(koneksi);
    await koneksi.commit();
    return hasil;
  } catch (error) {
    await koneksi.rollback();
    throw error;
  } finally {
    koneksi.release();       // koneksi selalu dikembalikan ke pool
  }
}
```

Contoh penerapan: menyimpan barang **dan** mencatat aktivitasnya. Bila pencatatan aktivitas gagal, penyimpanan barang ikut dibatalkan sehingga tidak ada perubahan data tanpa jejak audit.

Perhatikan seluruh fungsi repository menerima parameter `konektor` opsional yang bawaannya adalah `pool`. Itulah yang memungkinkan fungsi yang sama dipakai di dalam maupun di luar transaksi.

---

## 9. Pertanyaan yang Mungkin Ditanyakan Penguji

### Basis data & query

**Q: Kenapa tidak memakai ORM seperti Prisma? Bukankah lebih praktis?**
Karena tugas ini mensyaratkan SQL manual, dan saya mengikuti syarat itu. Manfaat yang saya rasakan: seluruh query terkumpul di folder `repository/`, jadi saat memeriksa keamanan cukup membaca empat berkas. Kekurangannya jujur saja ada — kodenya lebih panjang dan pemetaan hasil ke tipe TypeScript dilakukan manual. Untuk proyek berskala besar, ORM memang menghemat banyak waktu.

**Q: Bagaimana mencegah SQL injection?**
Semua nilai dari pengguna dikirim lewat placeholder `?`, tidak pernah disambung ke string SQL. Satu-satunya bagian yang tidak bisa memakai placeholder adalah nama kolom di `ORDER BY`, dan itu saya batasi dengan whitelist tetap yang ditegakkan tiga lapis. Ada pengujian yang mencoba `?sort=password` dan mendapat `422`.

**Q: Kenapa `kategori_id` memakai `ON DELETE RESTRICT`, bukan `CASCADE`?**
Karena `CASCADE` berarti menghapus satu kategori akan ikut menghapus semua barang di dalamnya — itu kehilangan data yang tidak disengaja. `RESTRICT` memaksa pengguna memindahkan barangnya dulu. Sebaliknya, `aktivitas_sistem` memakai `ON DELETE SET NULL` supaya menghapus akun tidak menghapus jejak auditnya; pelakunya cukup ditampilkan sebagai "Akun telah dihapus".

**Q: Mengapa `id` memakai `BIGINT UNSIGNED`?**
Kebiasaan aman untuk kolom yang bertambah terus. Untuk kasus ini `INT` sebenarnya sudah cukup — ini pilihan konservatif, bukan kebutuhan nyata.

### Autentikasi & keamanan

**Q: Kenapa token disimpan di cookie, bukan localStorage?**
`localStorage` bisa dibaca JavaScript apa pun di halaman, jadi satu celah XSS berarti token tercuri. Cookie `HttpOnly` tidak bisa disentuh JavaScript. Gantinya muncul risiko CSRF, yang saya tekan dengan `SameSite=Lax` dan CORS yang hanya mengizinkan satu origin.

**Q: Kalau JWT bisa dibaca siapa saja, apa gunanya?**
Yang dijamin JWT adalah keaslian, bukan kerahasiaan. Isinya memang bisa dibaca, tetapi tidak bisa diubah tanpa merusak tanda tangannya — dan tanda tangan hanya bisa dibuat dengan `JWT_SECRET` yang ada di server. Karena itu saya hanya menaruh id, email, dan role di payload; tidak ada password atau data sensitif.

**Q: Bagaimana kalau saya edit role di dalam token menjadi `admin`?**
Tanda tangannya langsung tidak cocok dan request ditolak `401`. Lagi pula role tidak diambil dari token — middleware autentikasi membacanya ulang dari basis data setiap request.

**Q: Bagaimana cara logout kalau JWT stateless?**
Logout menghapus cookie di browser, jadi token tidak lagi terkirim. Jujurnya, token itu sendiri secara teknis masih valid sampai kedaluwarsa — kalau seseorang sempat menyalinnya, token itu masih bisa dipakai. Solusi sebenarnya adalah *token blacklist* atau *refresh token*, yang tidak saya implementasikan karena di luar cakupan tugas. Sebagai peredam, masa berlaku token dibatasi 8 jam dan role selalu dibaca ulang dari database.

**Q: Kenapa bcrypt, bukan MD5 atau SHA-256?**
MD5 dan SHA-256 dirancang untuk cepat — justru merugikan untuk password, karena penyerang bisa mencoba miliaran kombinasi per detik. bcrypt sengaja lambat dan punya *cost factor* yang bisa dinaikkan seiring perangkat keras makin cepat. bcrypt juga otomatis menambahkan salt acak, sehingga rainbow table tidak berguna.

**Q: Kenapa pesan gagal login tidak membedakan "email tidak terdaftar" dan "password salah"?**
Karena membedakannya membocorkan email mana yang punya akun (*user enumeration*). Penyerang bisa memakai itu untuk menyusun daftar target sebelum menebak password. Kedua kasus memakai pesan identik `"Email atau password salah."`.

**Q: Apakah menyembunyikan menu sudah cukup untuk keamanan?**
Tidak, dan itu memang bukan mekanisme keamanannya — hanya kenyamanan agar pengguna tidak melihat menu yang tidak bisa dipakai. Penegakan sebenarnya ada di middleware backend. Saya sudah membuktikannya: memanggil `GET /api/users` sebagai viewer tetap dibalas `403` walaupun tombolnya tidak ada di layar.

### Upload berkas

**Q: Bagaimana kalau seseorang mengunggah file `.exe` yang diganti nama menjadi `.jpg`?**
Filter memeriksa MIME type yang dilaporkan, bukan ekstensi nama berkas, dan ekstensi yang tersimpan ditentukan dari hasil deteksi MIME itu. Jujurnya, MIME type dari client masih bisa dipalsukan; pemeriksaan yang lebih kuat adalah membaca *magic number* di byte awal berkas. Yang sudah aman: berkas unggahan disimpan di folder statis yang hanya menyajikan berkas, tidak pernah dieksekusi sebagai kode.

**Q: Kenapa nama berkasnya diacak?**
Dua alasan. Pertama keamanan — nama dari client bisa berisi `../` untuk menulis ke luar folder unggahan. Kedua kepraktisan — dua pengguna yang sama-sama mengunggah `foto.jpg` tidak akan saling menimpa.

**Q: Bagaimana memastikan tidak ada file menumpuk tanpa pemilik?**
Foto lama dihapus setelah update berhasil dan saat barang dihapus. Ada pengujian yang mengecek langsung ke disk bahwa berkas lama benar-benar hilang, dan pengujian browser yang membuktikan jumlah berkas di folder unggahan persis sama sebelum dan sesudah siklus create → update → delete.

### Arsitektur & kualitas

**Q: Kenapa dipisah controller, layanan, dan repository? Bukankah bisa langsung query di controller?**
Bisa, dan untuk aplikasi sekecil ini akan tetap jalan. Manfaatnya baru terasa saat memeriksa: semua SQL ada di satu folder, semua aturan bisnis di folder lain. Saat menguji aturan "kategori terpakai tidak boleh dihapus", saya tahu persis harus membaca berkas yang mana.

**Q: Apakah ada pengujian? Menguji apa saja?**
Ada 65 pengujian integrasi memakai Jest dan Supertest, berjalan terhadap basis data MySQL sungguhan — bukan tiruan — sehingga foreign key dan constraint `UNIQUE` ikut teruji. Cakupannya: login ketiga role, token rusak/kedaluwarsa, matriks role di seluruh endpoint, CRUD kategori dan barang, konflik duplikat, kategori terpakai, 404 konsisten, validasi, siklus hidup upload, reset password, larangan menghapus admin terakhir, dan jalur error 500 terkontrol.

**Q: Apa yang terjadi kalau server error? Apakah pengguna melihat stack trace?**
Tidak. Semua error berakhir di satu error handler pusat. Error yang terduga membawa status code-nya sendiri; error tak terduga dicatat lengkap di log server tetapi client hanya menerima pesan generik dengan status `500`. Ada pengujian yang secara eksplisit memeriksa bahwa respons tidak mengandung stack trace, jejak `node_modules`, maupun nama berkas internal.

**Q: Bagaimana penanganan error di frontend?**
Semua pemanggilan API lewat satu pembungkus `fetch` yang mengubah kegagalan apa pun menjadi satu jenis error (`KesalahanApi`) berisi status dan daftar kesalahan per-field. Komponen form tinggal menampilkan pesan di bawah input yang bersangkutan. Pesan konflik dari backend ditampilkan apa adanya lewat toast, misalnya *"Kategori "Komputer" masih dipakai oleh 3 barang dan tidak dapat dihapus."*

### Batasan yang saya sadari

**Q: Apa kekurangan sistem ini kalau dipakai sungguhan?**
Beberapa yang saya sadari dan sengaja tidak dikerjakan karena di luar cakupan tugas:
- Tidak ada *refresh token* maupun daftar cabut token, jadi logout tidak benar-benar mematikan token sampai kedaluwarsa.
- Reset password dilakukan admin secara manual, belum lewat email dengan tautan bertenggat.
- Rate limit disimpan di memori proses, sehingga hitungannya kembali nol saat server di-restart dan tidak dibagi antar instance bila di-*deploy* lebih dari satu.
- Belum ada pengujian otomatis frontend (unit/E2E yang tersimpan di repositori). Verifikasi antarmuka dilakukan lewat skrip Playwright terpisah, bukan bagian dari `npm test`.
- Deteksi tipe berkas masih mengandalkan MIME dari client, belum membaca *magic number*.
- Pagination memakai `OFFSET`, yang akan melambat pada data berjuta baris.

**Q: Apa bagian yang paling sulit?**
Memastikan berkas foto tidak menjadi *orphan*. Urutan operasinya harus tepat: berkas baru disimpan dulu, database diperbarui, **baru** berkas lama dihapus. Sempat juga ada bug yang tidak kelihatan sama sekali — foto tidak pernah muncul di browser karena header `Cross-Origin-Resource-Policy` bawaan Helmet memblokirnya, sementara komponen foto diam-diam jatuh ke placeholder tanpa pesan error. Ketahuan setelah memeriksa log jaringan browser, lalu saya kunci dengan pengujian khusus agar tidak terulang.
