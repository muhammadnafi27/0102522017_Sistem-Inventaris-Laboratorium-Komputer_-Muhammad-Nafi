import type { ResultSetHeader } from "mysql2";
import type { PoolConnection } from "mysql2/promise";

import { pool } from "@/konfigurasi/database";
import type { HitungRow, KategoriBarangRow, KategoriDenganJumlahRow } from "@/tipe/basis-data";

// Parameter pembuatan/perubahan kategori. Terpisah dari KategoriBarangRow karena
// id/created_at/updated_at dikelola oleh database, bukan oleh pemanggil.
export interface DataKategori {
  nama_kategori: string;
  deskripsi: string | null;
}

// Konektor opsional memungkinkan repository dipakai di dalam transaksi (lihat utilitas/transaksi.ts)
// maupun langsung memakai pool ketika tidak butuh transaksi.
type Konektor = PoolConnection | typeof pool;

export const kategoriRepository = {
  async cariSemua(konektor: Konektor = pool): Promise<KategoriBarangRow[]> {
    const [baris] = await konektor.execute<KategoriBarangRow[]>(
      "SELECT * FROM kategori_barang ORDER BY nama_kategori ASC",
    );
    return baris;
  },

  // Daftar kategori beserta jumlah barang yang memakainya (LEFT JOIN + GROUP BY agar
  // kategori tanpa barang tetap muncul dengan jumlah_barang = 0). Dipakai GET /api/kategori.
  async cariSemuaDenganJumlahBarang(konektor: Konektor = pool): Promise<KategoriDenganJumlahRow[]> {
    const [baris] = await konektor.execute<KategoriDenganJumlahRow[]>(
      `SELECT k.*, COUNT(b.id) AS jumlah_barang
       FROM kategori_barang k
       LEFT JOIN barang b ON b.kategori_id = k.id
       GROUP BY k.id
       ORDER BY k.nama_kategori ASC`,
    );
    return baris;
  },

  async hitungSemua(konektor: Konektor = pool): Promise<number> {
    const [baris] = await konektor.execute<HitungRow[]>("SELECT COUNT(*) AS total FROM kategori_barang");
    return Number(baris[0]?.total ?? 0);
  },

  async cariById(id: number, konektor: Konektor = pool): Promise<KategoriBarangRow | null> {
    const [baris] = await konektor.execute<KategoriBarangRow[]>(
      "SELECT * FROM kategori_barang WHERE id = ? LIMIT 1",
      [id],
    );
    return baris[0] ?? null;
  },

  // Dipakai untuk validasi nama unik sebelum insert/update. Collation kolom sudah
  // utf8mb4_unicode_ci (case-insensitive) sehingga pencarian ini otomatis tidak peka huruf besar/kecil.
  async cariByNama(nama: string, konektor: Konektor = pool): Promise<KategoriBarangRow | null> {
    const [baris] = await konektor.execute<KategoriBarangRow[]>(
      "SELECT * FROM kategori_barang WHERE nama_kategori = ? LIMIT 1",
      [nama],
    );
    return baris[0] ?? null;
  },

  // Menghitung jumlah barang yang masih memakai kategori ini. Dipakai untuk menampilkan
  // jumlah barang per kategori dan untuk mencegah penghapusan kategori yang masih dipakai.
  async hitungBarangTerpakai(kategoriId: number, konektor: Konektor = pool): Promise<number> {
    const [baris] = await konektor.execute<HitungRow[]>(
      "SELECT COUNT(*) AS total FROM barang WHERE kategori_id = ?",
      [kategoriId],
    );
    return Number(baris[0]?.total ?? 0);
  },

  async buat(data: DataKategori, konektor: Konektor = pool): Promise<number> {
    const [hasil] = await konektor.execute<ResultSetHeader>(
      "INSERT INTO kategori_barang (nama_kategori, deskripsi) VALUES (?, ?)",
      [data.nama_kategori, data.deskripsi],
    );
    return hasil.insertId;
  },

  async perbarui(id: number, data: DataKategori, konektor: Konektor = pool): Promise<boolean> {
    const [hasil] = await konektor.execute<ResultSetHeader>(
      "UPDATE kategori_barang SET nama_kategori = ?, deskripsi = ? WHERE id = ?",
      [data.nama_kategori, data.deskripsi, id],
    );
    return hasil.affectedRows > 0;
  },

  async hapus(id: number, konektor: Konektor = pool): Promise<boolean> {
    const [hasil] = await konektor.execute<ResultSetHeader>("DELETE FROM kategori_barang WHERE id = ?", [
      id,
    ]);
    return hasil.affectedRows > 0;
  },
};
