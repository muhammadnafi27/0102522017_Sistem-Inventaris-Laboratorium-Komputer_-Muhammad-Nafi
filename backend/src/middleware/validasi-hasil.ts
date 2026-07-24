import type { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

import { responsGagal } from "@/utilitas/respons";

// Middleware generik untuk memeriksa hasil express-validator pada rute manapun.
// Dipasang setelah rangkaian validator (body/query/param) pada definisi rute.
export function tanganiHasilValidasi(req: Request, res: Response, next: NextFunction): void {
  const hasil = validationResult(req);

  if (!hasil.isEmpty()) {
    const kesalahan = hasil.array({ onlyFirstError: true }).map((error) => ({
      field: error.type === "field" ? error.path : "umum",
      pesan: error.msg,
    }));
    responsGagal(res, 422, "Validasi input gagal.", kesalahan);
    return;
  }

  next();
}
