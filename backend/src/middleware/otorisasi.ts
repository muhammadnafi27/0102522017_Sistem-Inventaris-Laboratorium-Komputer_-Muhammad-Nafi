import type { NextFunction, Request, Response } from "express";

import type { RolePengguna } from "@/tipe/basis-data";
import { KesalahanAplikasi } from "@/tipe/kesalahan-aplikasi";

// Membatasi akses endpoint berdasarkan role. Wajib dipasang setelah middleware `autentikasi`
// karena bergantung pada req.pengguna yang sudah diisi. Menyembunyikan tombol di frontend saja
// tidak cukup - pembatasan ini adalah penegakan aslinya di sisi backend.
export function authorizeRoles(...roles: RolePengguna[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.pengguna) {
      next(new KesalahanAplikasi(401, "Anda belum login."));
      return;
    }

    if (!roles.includes(req.pengguna.role)) {
      next(new KesalahanAplikasi(403, "Anda tidak memiliki akses untuk aksi ini."));
      return;
    }

    next();
  };
}
