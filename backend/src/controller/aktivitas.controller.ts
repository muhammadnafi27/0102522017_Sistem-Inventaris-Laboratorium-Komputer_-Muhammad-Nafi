import type { Request, Response } from "express";

import { aktivitasLayanan } from "@/layanan/aktivitas.layanan";
import { responsSukses } from "@/utilitas/respons";

export const aktivitasController = {
  async daftar(req: Request, res: Response): Promise<void> {
    const hasil = await aktivitasLayanan.daftar({
      page: req.query.page as unknown as number | undefined,
      limit: req.query.limit as unknown as number | undefined,
      aksi: req.query.aksi as string | undefined,
      entitas: req.query.entitas as string | undefined,
    });
    responsSukses(res, 200, "Daftar aktivitas berhasil diambil.", hasil.data, hasil.meta);
  },
};
