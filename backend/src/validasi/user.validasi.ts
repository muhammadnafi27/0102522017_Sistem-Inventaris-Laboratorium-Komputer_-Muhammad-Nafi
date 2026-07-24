import { body, query } from "express-validator";

// Daftar role valid sesuai ENUM kolom role pada tabel users.
export const ROLE_VALID = ["admin", "operator", "viewer"] as const;

// Password minimal 8 karakter dan mengandung huruf serta angka - dipakai bersama oleh
// pembuatan user dan reset password (aturan bisnis PRD 3.2).
function validatorPassword(field: string) {
  return body(field)
    .isLength({ min: 8 })
    .withMessage(`${field} minimal 8 karakter.`)
    .bail()
    .matches(/[A-Za-z]/)
    .withMessage(`${field} harus mengandung huruf.`)
    .matches(/[0-9]/)
    .withMessage(`${field} harus mengandung angka.`);
}

// Validasi POST /api/users (admin membuat user baru, password ditentukan langsung).
export const validasiBuatUser = [
  body("nama").trim().isLength({ min: 3, max: 120 }).withMessage("Nama wajib diisi, 3-120 karakter."),
  body("email")
    .trim()
    .customSanitizer((nilai: string) => nilai.toLowerCase())
    .isEmail()
    .withMessage("Email tidak valid."),
  validatorPassword("password"),
  body("role").isIn(ROLE_VALID).withMessage("Role harus admin, operator, atau viewer."),
];

// Validasi PUT /api/users/:id (admin mengubah nama/email/role - tanpa password).
export const validasiPerbaruiUser = [
  body("nama").trim().isLength({ min: 3, max: 120 }).withMessage("Nama wajib diisi, 3-120 karakter."),
  body("email")
    .trim()
    .customSanitizer((nilai: string) => nilai.toLowerCase())
    .isEmail()
    .withMessage("Email tidak valid."),
  body("role").isIn(ROLE_VALID).withMessage("Role harus admin, operator, atau viewer."),
];

// Validasi PATCH /api/users/:id/reset-password.
export const validasiResetPassword = [
  validatorPassword("passwordBaru"),
  body("konfirmasiPassword").custom((nilai: string, { req }) => {
    if (nilai !== req.body.passwordBaru) {
      throw new Error("Konfirmasi password tidak cocok.");
    }
    return true;
  }),
];

// Validasi query string GET /api/users?page=&limit=&search=&role=.
export const validasiQueryDaftarUser = [
  query("page").optional().isInt({ min: 1 }).withMessage("page harus bilangan bulat positif.").toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit harus 1-100.").toInt(),
  query("search").optional({ values: "falsy" }).trim().isLength({ max: 160 }),
  query("role").optional({ values: "falsy" }).isIn(ROLE_VALID),
];
