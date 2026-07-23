import { Response, NextFunction } from 'express';
import { verifikasiTokenAkses } from '../utilitas/jwt';
import { AppRequest } from '../tipe/autentikasi';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

/**
 * Middleware autentikasi berbasis JWT.
 * Membaca token dari cookie HttpOnly, dengan fallback ke Bearer header untuk keperluan testing API.
 * Menyuntikkan data user yang terverifikasi ke dalam req.user.
 */
export const autentikasi = (req: AppRequest, res: Response, next: NextFunction): void => {
  const namaCookie = process.env.COOKIE_NAME ?? 'token_akses';
  let token: string | undefined = req.cookies[namaCookie];

  // Bearer fallback — berguna saat menguji API via Postman/cURL tanpa browser
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7); // Lebih efisien dari .split(' ')[1]
    }
  }

  if (!token) {
    res.status(401).json({
      sukses: false,
      pesan: 'Akses ditolak. Silakan login terlebih dahulu.',
    });
    return;
  }

  try {
    req.user = verifikasiTokenAkses(token);
    next();
  } catch (error) {
    // Membedakan antara token kadaluarsa dan token tidak valid
    if (error instanceof TokenExpiredError) {
      res.status(401).json({
        sukses: false,
        pesan: 'Sesi telah kedaluwarsa. Silakan login kembali.',
      });
    } else if (error instanceof JsonWebTokenError) {
      res.status(401).json({
        sukses: false,
        pesan: 'Token tidak valid.',
      });
    } else {
      res.status(401).json({
        sukses: false,
        pesan: 'Autentikasi gagal.',
      });
    }
  }
};
