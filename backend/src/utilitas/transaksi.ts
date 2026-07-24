import type { PoolConnection } from "mysql2/promise";

import { pool } from "@/konfigurasi/database";

// Menjalankan sekumpulan query dalam satu transaksi database. Dipakai oleh service yang
// perlu memastikan beberapa perubahan (mis. hapus barang + hapus foto, ubah role + catat aktivitas)
// tercatat semua atau tidak sama sekali.
export async function jalankanTransaksi<T>(
  callback: (koneksi: PoolConnection) => Promise<T>,
): Promise<T> {
  const koneksi = await pool.getConnection();

  try {
    await koneksi.beginTransaction();
    const hasil = await callback(koneksi);
    await koneksi.commit();
    return hasil;
  } catch (error) {
    // Rollback wajib menunggu selesai sebelum error diteruskan agar koneksi tidak
    // dikembalikan ke pool dalam kondisi transaksi masih terbuka.
    await koneksi.rollback();
    throw error;
  } finally {
    koneksi.release();
  }
}
