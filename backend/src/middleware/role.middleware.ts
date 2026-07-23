import { Response, NextFunction } from 'express';
import { AppRequest } from '../tipe/autentikasi';

/**
 * Middleware untuk membatasi akses berdasarkan peran (Role-Based Access Control).
 * Harus dipanggil setelah middleware autentikasi.
 * @param roles Array peran yang diizinkan
 */
export const izinkanRole = (...roles: string[]) => {
  return (req: AppRequest, res: Response, next: NextFunction) => {
    // Pastikan user ada dari middleware sebelumnya
    if (!req.user) {
      return res.status(401).json({ sukses: false, pesan: "Harap login" });
    }

    // Periksa apakah role user termasuk dalam daftar role yang diizinkan
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        sukses: false,
        pesan: "Anda tidak memiliki hak akses untuk aksi ini."
      });
    }

    next();
  };
};
