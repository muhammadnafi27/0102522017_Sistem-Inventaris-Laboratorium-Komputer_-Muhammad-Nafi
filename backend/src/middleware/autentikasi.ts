import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { usersRepository } from "@/repository/users.repository";
import { KesalahanAplikasi } from "@/tipe/kesalahan-aplikasi";
import { NAMA_COOKIE_TOKEN } from "@/utilitas/cookie";
import { verifikasiToken } from "@/utilitas/jwt";

// Middleware autentikasi: membaca token dari cookie HttpOnly access_token (dipakai frontend)
// atau header Authorization Bearer (dipakai untuk pengujian API/Postman), memverifikasi JWT,
// lalu memuat ulang data user dari database. Memuat ulang dari DB (bukan sekadar percaya payload
// token) memastikan role yang dipakai selalu yang terbaru meskipun token lama masih berlaku.
export async function autentikasi(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const tokenDariCookie = req.cookies?.[NAMA_COOKIE_TOKEN] as string | undefined;
    const headerAuth = req.headers.authorization;
    const tokenDariHeader = headerAuth?.startsWith("Bearer ") ? headerAuth.slice(7) : undefined;
    const token = tokenDariCookie ?? tokenDariHeader;

    if (!token) {
      throw new KesalahanAplikasi(401, "Anda belum login.");
    }

    const payload = verifikasiToken(token);

    const baris = await usersRepository.cariById(payload.sub);
    if (!baris) {
      throw new KesalahanAplikasi(401, "Akun tidak ditemukan atau telah dihapus.");
    }

    req.pengguna = { id: baris.id, nama: baris.nama, email: baris.email, role: baris.role };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new KesalahanAplikasi(401, "Sesi telah berakhir, silakan login kembali."));
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      next(new KesalahanAplikasi(401, "Token tidak valid."));
      return;
    }
    next(error);
  }
}
