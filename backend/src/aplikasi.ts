import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import ruteKesehatan from './rute/kesehatan.rute';
import ruteAutentikasi from './rute/autentikasi.rute';
import ruteKategori from './rute/kategori.rute';
import ruteBarang from './rute/barang.rute';
import ruteUser from './rute/user.rute';
import { AppError } from './utilitas/AppError';

// Inisialisasi Express app
const app = express();

// Konfigurasi middleware dasar
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:3001',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Menyajikan file statis dari folder unggahan
app.use('/unggahan', express.static('unggahan'));

// Rute API
app.use('/api/auth', ruteAutentikasi);
app.use('/api/users', ruteUser);
app.use('/api/kategori', ruteKategori);
app.use('/api/barang', ruteBarang);
app.use('/api', ruteKesehatan);

// Endpoint uji middleware role — HANYA aktif di mode development
if (process.env.NODE_ENV === 'development') {
  // Impor dinamis agar tidak ikut bundle production
  Promise.all([
    import('./middleware/autentikasi.middleware'),
    import('./middleware/role.middleware'),
  ]).then(([{ autentikasi }, { izinkanRole }]) => {
    app.get('/api/tes-admin', autentikasi, izinkanRole('admin'), (_req: Request, res: Response) => {
      res.json({ sukses: true, pesan: 'Berhasil masuk ke rute admin' });
    });
    app.get('/api/tes-operator', autentikasi, izinkanRole('admin', 'operator'), (_req: Request, res: Response) => {
      res.json({ sukses: true, pesan: 'Berhasil masuk ke rute operator/admin' });
    });
  });
}

// Handler 404 — route tidak ditemukan
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    sukses: false,
    pesan: 'Route tidak ditemukan',
  });
});

// Handler error global — menerima AppError dan error generik
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  // Log error untuk keperluan debugging di server
  console.error('[ERROR]', err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      sukses: false,
      pesan: err.message,
    });
    return;
  }

  // Error tak terduga — jangan bocorkan detail ke client
  res.status(500).json({
    sukses: false,
    pesan: 'Terjadi kesalahan internal pada server',
  });
});

export default app;
