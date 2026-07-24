import { body } from "express-validator";

// Validasi register sesuai aturan bisnis PRD 3.2: nama wajib, email valid & dinormalisasi
// lowercase, password minimal 8 karakter dengan kombinasi huruf dan angka.
export const validasiRegister = [
  body("nama")
    .trim()
    .isLength({ min: 3, max: 120 })
    .withMessage("Nama wajib diisi, 3-120 karakter."),
  body("email")
    .trim()
    .customSanitizer((nilai: string) => nilai.toLowerCase())
    .isEmail()
    .withMessage("Email tidak valid."),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password minimal 8 karakter.")
    .matches(/[A-Za-z]/)
    .withMessage("Password harus mengandung huruf.")
    .matches(/[0-9]/)
    .withMessage("Password harus mengandung angka."),
  body("konfirmasiPassword").custom((nilai: string, { req }) => {
    if (nilai !== req.body.password) {
      throw new Error("Konfirmasi password tidak cocok.");
    }
    return true;
  }),
];

// Validasi login: email wajib valid, password wajib diisi (aturan kompleksitas tidak dicek
// ulang di sini karena kebenaran password ditentukan oleh perbandingan hash, bukan format).
export const validasiLogin = [
  body("email")
    .trim()
    .customSanitizer((nilai: string) => nilai.toLowerCase())
    .isEmail()
    .withMessage("Email tidak valid."),
  body("password").notEmpty().withMessage("Password wajib diisi."),
  body("ingatSaya").optional().isBoolean().withMessage("ingatSaya harus bernilai boolean."),
];
