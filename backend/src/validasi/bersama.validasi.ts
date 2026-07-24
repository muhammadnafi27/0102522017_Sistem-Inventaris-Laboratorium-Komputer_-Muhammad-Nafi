import { param } from "express-validator";

// Validator :id pada parameter rute. Dipakai berulang oleh rute kategori, barang, dan user.
export const validasiParamId = [param("id").isInt({ min: 1 }).withMessage("ID tidak valid.").toInt()];
