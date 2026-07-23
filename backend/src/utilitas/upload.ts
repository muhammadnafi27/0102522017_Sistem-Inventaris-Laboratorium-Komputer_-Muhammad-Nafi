import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { AppError } from './AppError';

// Folder tujuan upload — dibuat otomatis saat modul dimuat jika belum ada
const direktoriUpload = path.join(process.cwd(), 'unggahan', 'barang');

if (!fs.existsSync(direktoriUpload)) {
  fs.mkdirSync(direktoriUpload, { recursive: true });
}

// Konfigurasi Multer diskStorage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, direktoriUpload);
  },
  filename: (_req, file, cb) => {
    // Menghasilkan nama unik: waktu + string acak + ekstensi asli
    const acak = crypto.randomBytes(8).toString('hex');
    const ekstensi = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${acak}${ekstensi}`);
  }
});

// Filter file berdasarkan mimetype DAN ekstensi (keamanan ganda)
const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ekstensiDiizinkan = new Set(['.jpeg', '.jpg', '.png', '.webp']);
  const tipeMimeDiizinkan = new Set(['image/jpeg', 'image/png', 'image/webp']);

  const ekstensiFile = path.extname(file.originalname).toLowerCase();

  if (ekstensiDiizinkan.has(ekstensiFile) && tipeMimeDiizinkan.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Format file tidak valid. Hanya menerima JPEG, PNG, atau WEBP.', 400));
  }
};

// Batasan ukuran maksimum (didapat dari env atau default 2MB)
const uploadMaxMb = process.env.UPLOAD_MAX_MB ? parseInt(process.env.UPLOAD_MAX_MB, 10) : 2;

// Middleware upload yang siap digunakan di rute
export const uploadBarang = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: uploadMaxMb * 1024 * 1024,
    files: 1, // Batasi hanya 1 file per request
  },
});
