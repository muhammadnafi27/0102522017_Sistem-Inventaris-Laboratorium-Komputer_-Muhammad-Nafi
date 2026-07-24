import { query } from "express-validator";

// Validasi query string GET /api/aktivitas?page=&limit=&aksi=&entitas=. Filter sengaja
// dibuat sederhana (exact match) sesuai kebutuhan Prompt Master 6, bukan pencarian bebas.
export const validasiQueryAktivitas = [
  query("page").optional().isInt({ min: 1 }).withMessage("page harus bilangan bulat positif.").toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit harus 1-100.").toInt(),
  query("aksi").optional({ values: "falsy" }).trim().isLength({ max: 80 }),
  query("entitas").optional({ values: "falsy" }).trim().isLength({ max: 80 }),
];
