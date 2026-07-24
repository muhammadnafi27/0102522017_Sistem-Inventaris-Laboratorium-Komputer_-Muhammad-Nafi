import type { Request, Response } from "express";

import { authLayanan } from "@/layanan/auth.layanan";
import { KesalahanAplikasi } from "@/tipe/kesalahan-aplikasi";
import { hapusCookieToken, setCookieToken } from "@/utilitas/cookie";
import { responsSukses } from "@/utilitas/respons";

// Controller tetap tipis: hanya membaca request, memanggil layanan, dan membentuk respons HTTP.
// Express 5 meneruskan otomatis error dari async handler ke error handler pusat, sehingga
// tidak perlu try/catch manual di sini.
export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const { nama, email, password } = req.body as { nama: string; email: string; password: string };
    const pengguna = await authLayanan.register({ nama, email, password });
    responsSukses(res, 201, "Registrasi berhasil. Silakan login.", pengguna);
  },

  async login(req: Request, res: Response): Promise<void> {
    const { email, password, ingatSaya } = req.body as {
      email: string;
      password: string;
      ingatSaya?: boolean;
    };

    const { pengguna, token } = await authLayanan.login(email, password, Boolean(ingatSaya), req.ip);
    setCookieToken(res, token, Boolean(ingatSaya));
    responsSukses(res, 200, `Selamat datang, ${pengguna.nama}.`, pengguna);
  },

  me(req: Request, res: Response): void {
    // req.pengguna dijamin terisi karena rute ini selalu dipasangi middleware `autentikasi`.
    if (!req.pengguna) {
      throw new KesalahanAplikasi(401, "Anda belum login.");
    }
    responsSukses(res, 200, "Data pengguna aktif.", req.pengguna);
  },

  logout(_req: Request, res: Response): void {
    hapusCookieToken(res);
    responsSukses(res, 200, "Logout berhasil.");
  },
};
