import { body, query } from "express-validator";

import { KOLOM_SORT_BARANG } from "@/repository/barang.repository";

// Daftar kondisi valid sesuai ENUM kolom kondisi pada tabel barang (PRD 3.1).
export const KONDISI_BARANG_VALID = ["Baik", "Perlu Perawatan", "Rusak", "Tidak Aktif"] as const;

// Validasi tambah/ubah barang sesuai aturan bisnis PRD 3.1. Keberadaan kategori_id di
// database dicek pada lapisan layanan, bukan di sini (butuh query, bukan validasi format).
export const validasiBarang = [
  body("kode_barang")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Kode barang wajib diisi, 2-50 karakter.")
    .bail()
    .matches(/^[A-Za-z0-9-]+$/)
    .withMessage("Kode barang hanya boleh huruf, angka, dan tanda hubung."),
  body("nama_barang")
    .trim()
    .isLength({ min: 3, max: 160 })
    .withMessage("Nama barang wajib diisi, 3-160 karakter."),
  body("kategori_id").isInt({ min: 1 }).withMessage("Kategori wajib dipilih.").toInt(),
  body("kondisi").isIn(KONDISI_BARANG_VALID).withMessage("Kondisi tidak valid."),
  body("lokasi").trim().isLength({ min: 2, max: 120 }).withMessage("Lokasi wajib diisi, 2-120 karakter."),
  body("jumlah")
    .isInt({ min: 0, max: 100000 })
    .withMessage("Jumlah harus berupa bilangan bulat 0-100000.")
    .toInt(),
  body("foto").optional({ values: "falsy" }).isString(),
];

// Validasi query string GET /api/barang: page, limit, search, kategori_id, kondisi, lokasi,
// sort, order. Sort dibatasi whitelist KOLOM_SORT_BARANG agar aman dipakai pada ORDER BY.
export const validasiQueryDaftarBarang = [
  query("page").optional().isInt({ min: 1 }).withMessage("page harus bilangan bulat positif.").toInt(),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit harus 1-100.")
    .toInt(),
  query("search").optional({ values: "falsy" }).trim().isLength({ max: 160 }),
  query("kategori_id").optional({ values: "falsy" }).isInt({ min: 1 }).toInt(),
  query("kondisi").optional({ values: "falsy" }).isIn(KONDISI_BARANG_VALID),
  query("lokasi").optional({ values: "falsy" }).trim().isLength({ max: 120 }),
  query("sort").optional({ values: "falsy" }).isIn(KOLOM_SORT_BARANG),
  query("order").optional({ values: "falsy" }).isIn(["asc", "desc", "ASC", "DESC"]),
];
