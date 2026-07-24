import type { CookieOptions, Response } from "express";
import ms from "ms";

import { environment } from "@/konfigurasi/environment";

// Nama cookie tempat JWT disimpan. Dipakai konsisten oleh middleware autentikasi, login, dan logout.
export const NAMA_COOKIE_TOKEN = "access_token";

// Atribut cookie dasar. secure hanya aktif pada production karena localhost (development)
// umumnya berjalan tanpa HTTPS. Atribut ini harus identik antara set (login) dan clear (logout)
// agar browser benar-benar menghapus cookie yang sama.
function opsiCookieDasar(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: environment.isProduction,
    path: "/",
  };
}

// Mengeset cookie access_token setelah login berhasil. maxAge dihitung dari string durasi
// pada .env (mis. "8h"/"7d") memakai package "ms" agar tetap sinkron dengan masa berlaku JWT.
export function setCookieToken(res: Response, token: string, ingatSaya: boolean): void {
  const durasi = ingatSaya ? environment.jwt.expiresInIngatSaya : environment.jwt.expiresIn;
  const maxAge = ms(durasi as ms.StringValue);

  res.cookie(NAMA_COOKIE_TOKEN, token, { ...opsiCookieDasar(), maxAge });
}

// Menghapus cookie access_token saat logout. Atribut harus sama persis dengan saat diset.
export function hapusCookieToken(res: Response): void {
  res.clearCookie(NAMA_COOKIE_TOKEN, opsiCookieDasar());
}
