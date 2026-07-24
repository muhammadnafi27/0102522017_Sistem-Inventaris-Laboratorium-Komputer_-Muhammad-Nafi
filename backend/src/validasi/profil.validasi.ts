import { body } from "express-validator";

// Validasi PUT /api/profil. Sesuai PRD FR-15: pengguna dapat memperbarui nama; email boleh
// diikutsertakan tetapi opsional (kosongkan berarti tidak diubah) dan tetap divalidasi unik
// pada lapisan layanan. Role tidak termasuk di sini karena tidak dapat diubah sendiri oleh pengguna.
export const validasiPerbaruiProfil = [
  body("nama").trim().isLength({ min: 3, max: 120 }).withMessage("Nama wajib diisi, 3-120 karakter."),
  body("email")
    .optional({ values: "falsy" })
    .trim()
    .customSanitizer((nilai: string) => nilai.toLowerCase())
    .isEmail()
    .withMessage("Email tidak valid."),
];
