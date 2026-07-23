import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser } from '../layanan/autentikasi.layanan';
import { buatTokenAkses, opsiCookieToken } from '../utilitas/jwt';
import { AppRequest } from '../tipe/autentikasi';

const NAMA_COOKIE = process.env.COOKIE_NAME ?? 'token_akses';

/**
 * POST /api/auth/register
 * Mendaftarkan pengguna baru dengan role 'viewer'.
 * Validasi input dasar dilakukan di sini; validasi bisnis ada di layanan.
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { nama, email, password } = req.body as { nama?: string; email?: string; password?: string };

    if (!nama?.trim() || !email?.trim() || !password) {
      res.status(400).json({ sukses: false, pesan: 'Nama, email, dan password wajib diisi' });
      return;
    }

    const user = await registerUser(nama, email, password);

    res.status(201).json({
      sukses: true,
      pesan: 'Registrasi berhasil. Silakan login.',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Memvalidasi kredensial dan mengeluarkan JWT via cookie HttpOnly.
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email?.trim() || !password) {
      res.status(400).json({ sukses: false, pesan: 'Email dan password wajib diisi' });
      return;
    }

    const user = await loginUser(email, password);
    const token = buatTokenAkses(user);

    res.cookie(NAMA_COOKIE, token, opsiCookieToken);
    res.status(200).json({
      sukses: true,
      pesan: 'Login berhasil',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 * Membersihkan cookie token. Tidak perlu async karena tidak ada I/O.
 */
export const logout = (_req: Request, res: Response): void => {
  res.clearCookie(NAMA_COOKIE, { path: '/' });
  res.status(200).json({
    sukses: true,
    pesan: 'Logout berhasil',
  });
};

/**
 * GET /api/auth/saya
 * Mengembalikan profil pengguna yang sedang login (dari JWT yang telah terverifikasi).
 */
export const saya = (req: AppRequest, res: Response): void => {
  res.status(200).json({
    sukses: true,
    pesan: 'Profil berhasil diambil',
    data: req.user,
  });
};
