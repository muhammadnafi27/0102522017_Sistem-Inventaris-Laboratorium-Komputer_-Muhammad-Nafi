import type { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";

import { environment } from "@/konfigurasi/environment";
import { KesalahanAplikasi } from "@/tipe/kesalahan-aplikasi";
import { logger } from "@/utilitas/logger";
import { responsGagal } from "@/utilitas/respons";

// Middleware untuk rute yang tidak ditemukan. Diletakkan setelah seluruh rute terdaftar.
export function penanganRuteTidakDitemukan(req: Request, res: Response): void {
  responsGagal(res, 404, `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan.`);
}

// Error handler pusat Express. Wajib memiliki 4 parameter agar dikenali sebagai error middleware.
// Seluruh error yang dilempar dari controller/service/middleware lain akan berakhir di sini.
export function penanganErrorPusat(
  error: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
): void {
  // Error terduga (validasi, akses ditolak, dsb) sudah membawa status code yang tepat.
  if (error instanceof KesalahanAplikasi) {
    responsGagal(res, error.statusCode, error.message, error.kesalahanField);
    return;
  }

  // Error dari Multer (upload foto): ukuran file melebihi batas dipetakan ke 413, sisanya
  // (field tak dikenal, dsb) ke 400. Pesan dibuat ramah pengguna, bukan kode teknis Multer.
  if (error instanceof MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      responsGagal(
        res,
        413,
        `Ukuran foto melebihi batas maksimum ${environment.uploadMaxMb} MB.`,
      );
      return;
    }
    responsGagal(res, 400, "Berkas foto tidak valid atau tidak dapat diunggah.");
    return;
  }

  // Error tidak terduga dicatat penuh di server, tetapi client hanya menerima pesan generik
  // agar detail internal (stack trace, query SQL, dsb) tidak bocor ke luar.
  logger.error(`Kesalahan tidak terduga pada ${req.method} ${req.originalUrl}`, error);

  const pesan = environment.isProduction
    ? "Terjadi kesalahan pada server. Silakan coba lagi."
    : error instanceof Error
      ? error.message
      : "Terjadi kesalahan pada server.";

  responsGagal(res, 500, pesan);
}
