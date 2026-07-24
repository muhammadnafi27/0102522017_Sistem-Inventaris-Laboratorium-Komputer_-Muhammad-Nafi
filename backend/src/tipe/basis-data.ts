import type { RowDataPacket } from "mysql2";

// Role pengguna sesuai ENUM kolom role pada tabel users.
export type RolePengguna = "admin" | "operator" | "viewer";

// Kondisi barang sesuai ENUM kolom kondisi pada tabel barang.
export type KondisiBarang = "Baik" | "Perlu Perawatan" | "Rusak" | "Tidak Aktif";

// Bentuk baris tabel kategori_barang. Extends RowDataPacket agar kompatibel dengan
// hasil query mysql2 (pool.query<KategoriBarangRow[]>(...)).
export interface KategoriBarangRow extends RowDataPacket {
  id: number;
  nama_kategori: string;
  deskripsi: string | null;
  created_at: string;
  updated_at: string;
}

export interface BarangRow extends RowDataPacket {
  id: number;
  kode_barang: string;
  nama_barang: string;
  kategori_id: number;
  kondisi: KondisiBarang;
  lokasi: string;
  jumlah: number;
  foto: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRow extends RowDataPacket {
  id: number;
  nama: string;
  email: string;
  password: string;
  role: RolePengguna;
  reset_token: string | null;
  reset_token_expired_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AktivitasSistemRow extends RowDataPacket {
  id: number;
  user_id: number | null;
  aksi: string;
  entitas: string;
  entitas_id: number | null;
  detail: string | null;
  ip_address: string | null;
  created_at: string;
}

// Bentuk baris hasil query agregasi COUNT(*) AS total. Dipakai berulang oleh berbagai
// repository sehingga didefinisikan satu kali di sini.
export interface HitungRow extends RowDataPacket {
  total: number;
}

// Baris kategori_barang hasil JOIN dengan agregasi COUNT(barang.id), dipakai pada
// GET /api/kategori agar frontend bisa menampilkan jumlah barang per kategori sekaligus.
export interface KategoriDenganJumlahRow extends KategoriBarangRow {
  jumlah_barang: number;
}

// Baris barang hasil JOIN dengan kategori_barang, dipakai pada daftar dan detail barang
// agar frontend tidak perlu memanggil endpoint kategori terpisah hanya untuk menampilkan nama kategori.
export interface BarangDenganKategoriRow extends BarangRow {
  nama_kategori: string;
}

// Hasil GROUP BY kondisi pada tabel barang, dipakai untuk kartu statistik dashboard.
export interface DistribusiKondisiRow extends RowDataPacket {
  kondisi: KondisiBarang;
  total: number;
}

// Hasil GROUP BY kategori (LEFT JOIN barang), dipakai untuk grafik distribusi kategori dashboard.
export interface DistribusiKategoriRow extends RowDataPacket {
  nama_kategori: string;
  total: number;
}

// Baris aktivitas_sistem hasil LEFT JOIN users, dipakai GET /api/aktivitas agar tabel
// dapat langsung menampilkan nama/email pelaku tanpa query tambahan. LEFT JOIN (bukan JOIN)
// karena user_id boleh NULL setelah akun pelaku dihapus (ON DELETE SET NULL).
export interface AktivitasDenganUserRow extends AktivitasSistemRow {
  nama_pengguna: string | null;
  email_pengguna: string | null;
}
