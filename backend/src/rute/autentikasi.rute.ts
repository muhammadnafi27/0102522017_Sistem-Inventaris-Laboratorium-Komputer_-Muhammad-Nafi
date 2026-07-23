import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, logout, saya } from '../kontroler/autentikasi.kontroler';
import { autentikasi } from '../middleware/autentikasi.middleware';

const ruteAutentikasi = Router();

// Rate limiter sederhana khusus endpoint login (mencegah brute-force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 10, // Maksimal 10 percobaan per IP
  message: {
    sukses: false,
    pesan: "Terlalu banyak percobaan login, coba lagi setelah 15 menit"
  }
});

// Endpoint publik
ruteAutentikasi.post('/register', register);
ruteAutentikasi.post('/login', loginLimiter, login);

// Endpoint terproteksi
ruteAutentikasi.post('/logout', autentikasi, logout);
ruteAutentikasi.get('/saya', autentikasi, saya);

export default ruteAutentikasi;
