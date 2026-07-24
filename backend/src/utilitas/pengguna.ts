import type { Request } from "express";

import type { PenggunaAktif } from "@/tipe/express";
import { KesalahanAplikasi } from "@/tipe/kesalahan-aplikasi";

// Mengambil req.pengguna dengan aman dari controller yang rutenya sudah dipasangi middleware
// `autentikasi`. Melempar 401 jika entah bagaimana middleware belum berjalan, alih-alih
// memakai non-null assertion (!) yang bisa diam-diam salah bila urutan middleware berubah.
export function penggunaWajib(req: Request): PenggunaAktif {
  if (!req.pengguna) {
    throw new KesalahanAplikasi(401, "Anda belum login.");
  }
  return req.pengguna;
}
