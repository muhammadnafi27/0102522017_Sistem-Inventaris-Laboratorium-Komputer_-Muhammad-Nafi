import mysql from "mysql2/promise";

import { environment } from "@/konfigurasi/environment";
import { logger } from "@/utilitas/logger";

// Connection pool tunggal yang dipakai seluruh repository. connectionLimit dijaga wajar
// untuk aplikasi demo satu laboratorium; queueLimit 0 berarti antrean tidak dibatasi.
// dateStrings true agar kolom TIMESTAMP/DATETIME dikembalikan sebagai string "YYYY-MM-DD HH:mm:ss"
// tanpa konversi timezone implisit dari driver, sehingga lebih mudah diserialisasi ke JSON.
export const pool = mysql.createPool({
  host: environment.db.host,
  port: environment.db.port,
  user: environment.db.user,
  password: environment.db.password,
  database: environment.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  charset: "utf8mb4_unicode_ci",
});

// Menguji koneksi database saat server start. Kegagalan di sini harus menghentikan proses
// lebih awal dengan pesan yang jelas, alih-alih membiarkan error samar muncul saat request pertama.
export async function ujiKoneksiDatabase(): Promise<void> {
  try {
    const koneksi = await pool.getConnection();
    try {
      await koneksi.query("SELECT 1");
      logger.info(
        `Koneksi database berhasil ke ${environment.db.host}:${environment.db.port}/${environment.db.database}.`,
      );
    } finally {
      koneksi.release();
    }
  } catch (error) {
    const kesalahan = error as NodeJS.ErrnoException;

    // Pesan dibedakan berdasarkan kode error agar mudah didiagnosis: server MySQL/XAMPP
    // belum aktif (ECONNREFUSED), database belum diimpor (ER_BAD_DB_ERROR), atau kredensial salah.
    let penjelasan = "Periksa kembali konfigurasi DB_HOST/DB_PORT/DB_USER/DB_PASSWORD pada .env.";
    if (kesalahan.code === "ECONNREFUSED") {
      penjelasan = "MySQL/XAMPP tampaknya belum aktif. Jalankan modul MySQL pada XAMPP Control Panel.";
    } else if (kesalahan.code === "ER_BAD_DB_ERROR") {
      penjelasan = `Database "${environment.db.database}" belum ada. Impor database/inventaris.sql melalui phpMyAdmin terlebih dahulu.`;
    } else if (kesalahan.code === "ER_ACCESS_DENIED_ERROR") {
      penjelasan = "Kredensial DB_USER/DB_PASSWORD ditolak MySQL. Periksa kembali nilai pada .env.";
    }

    throw new Error(`Gagal terhubung ke database. ${penjelasan} (${kesalahan.code ?? kesalahan.message})`, {
      cause: error,
    });
  }
}

// Menutup seluruh koneksi pool dengan rapi. Dipanggil saat proses backend dimatikan (SIGINT/SIGTERM).
export async function tutupPoolDatabase(): Promise<void> {
  await pool.end();
  logger.info("Pool koneksi database telah ditutup.");
}
