import app from './aplikasi';
import pool from './konfigurasi/database';
import { Server } from 'http';

const port = Number(process.env.PORT) || 3000;

/**
 * Menutup server dan pool database dengan bersih saat proses dihentikan.
 * Mencegah koneksi database menggantung (connection leak).
 */
const matikanServer = (server: Server): void => {
  server.close(async () => {
    console.log('[server] Menutup koneksi database...');
    try {
      await pool.end();
      console.log('[server] Pool database berhasil ditutup. Sampai jumpa.');
    } catch (err) {
      console.error('[server] Gagal menutup pool database:', err);
    }
    process.exit(0);
  });
};

const startServer = async (): Promise<void> => {
  // Verifikasi koneksi database saat startup
  try {
    const koneksi = await pool.getConnection();
    koneksi.release(); // Kembalikan koneksi ke pool segera setelah diverifikasi
    console.log('[server] Koneksi database MySQL berhasil.');
  } catch (error) {
    console.warn('[server] Peringatan: Gagal terhubung ke database. Server tetap berjalan:', error);
  }

  const server = app.listen(port, () => {
    console.log(`[server] Backend berjalan di http://localhost:${port} (mode: ${process.env.NODE_ENV ?? 'development'})`);
  });

  // Graceful shutdown: tangkap sinyal terminasi dari OS/Docker/PM2
  process.on('SIGTERM', () => {
    console.log('[server] Menerima SIGTERM, memulai graceful shutdown...');
    matikanServer(server);
  });
  process.on('SIGINT', () => {
    console.log('[server] Menerima SIGINT (Ctrl+C), memulai graceful shutdown...');
    matikanServer(server);
  });
};

startServer();
