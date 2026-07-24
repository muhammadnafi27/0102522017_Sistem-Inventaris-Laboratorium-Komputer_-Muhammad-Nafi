import crypto from "node:crypto";

import multer, { type FileFilterCallback } from "multer";
import type { Request } from "express";

import { environment } from "@/konfigurasi/environment";
import { EKSTENSI_PER_MIME, FOLDER_UNGGAHAN_BARANG, MIME_FOTO_DIIZINKAN } from "@/konfigurasi/unggahan";
import { KesalahanAplikasi } from "@/tipe/kesalahan-aplikasi";

// Penyimpanan disk untuk foto barang. destination berupa string (bukan fungsi) agar Multer
// otomatis membuat foldernya secara rekursif bila belum ada.
const penyimpananFotoBarang = multer.diskStorage({
  destination: FOLDER_UNGGAHAN_BARANG,
  filename: (_req, file, callback) => {
    // Nama file dibuat dari random bytes + ekstensi hasil deteksi MIME type - bukan dari
    // originalname kiriman client - supaya tidak bisa dipakai untuk path traversal maupun
    // menyamarkan file berbahaya sebagai gambar (mis. "../../server.ts" atau "virus.jpg.exe").
    const namaUnik = `barang-${crypto.randomBytes(16).toString("hex")}${EKSTENSI_PER_MIME[file.mimetype]}`;
    callback(null, namaUnik);
  },
});

// Hanya menerima MIME type gambar yang di-whitelist. File selain itu ditolak sebelum
// satu byte pun ditulis ke disk (fileFilter dievaluasi sebelum StorageEngine dipanggil).
function filterTipeFoto(_req: Request, file: Express.Multer.File, callback: FileFilterCallback): void {
  if (!MIME_FOTO_DIIZINKAN.includes(file.mimetype)) {
    callback(new KesalahanAplikasi(400, "Format foto harus JPG, PNG, atau WebP."));
    return;
  }
  callback(null, true);
}

// Middleware siap pakai untuk field multipart "foto" pada create/update barang. Request
// tanpa Content-Type multipart/form-data (mis. JSON biasa) dilewati begitu saja oleh Multer,
// sehingga endpoint yang sama tetap kompatibel dengan body JSON tanpa foto.
export const unggahFotoBarang = multer({
  storage: penyimpananFotoBarang,
  fileFilter: filterTipeFoto,
  limits: { fileSize: environment.uploadMaxMb * 1024 * 1024 },
}).single("foto");
