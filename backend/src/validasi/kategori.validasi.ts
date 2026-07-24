import { body } from "express-validator";

// Validasi tambah/ubah kategori. Cek duplikat nama dilakukan pada lapisan layanan
// karena butuh query ke database, bukan validasi format murni.
export const validasiKategori = [
  body("nama_kategori")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Nama kategori wajib diisi, 2-100 karakter."),
  body("deskripsi")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 255 })
    .withMessage("Deskripsi maksimal 255 karakter."),
];
