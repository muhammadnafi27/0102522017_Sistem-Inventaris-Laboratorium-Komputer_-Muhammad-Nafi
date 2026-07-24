import type { Response } from "express";

// Struktur meta pagination yang konsisten pada seluruh endpoint list.
export interface MetaPagination {
  halaman: number;
  batas: number;
  totalData: number;
  totalHalaman: number;
}

// Struktur error per-field agar frontend dapat menampilkan pesan tepat di bawah input.
export interface KesalahanField {
  field: string;
  pesan: string;
}

// Helper respons sukses baku sesuai kontrak PRD bagian 7.1.
export function responsSukses<T>(
  res: Response,
  statusCode: number,
  pesan: string,
  data?: T,
  meta?: MetaPagination,
): Response {
  return res.status(statusCode).json({
    sukses: true,
    pesan,
    data: data ?? null,
    ...(meta ? { meta } : {}),
  });
}

// Helper respons gagal baku. Detail teknis sengaja tidak dikirim ke client demi keamanan.
export function responsGagal(
  res: Response,
  statusCode: number,
  pesan: string,
  kesalahan?: KesalahanField[],
): Response {
  return res.status(statusCode).json({
    sukses: false,
    pesan,
    ...(kesalahan ? { kesalahan } : {}),
  });
}
