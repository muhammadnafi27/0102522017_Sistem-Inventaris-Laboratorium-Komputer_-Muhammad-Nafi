import type { Request, Response } from "express";

import { profilLayanan } from "@/layanan/profil.layanan";
import { penggunaWajib } from "@/utilitas/pengguna";
import { responsSukses } from "@/utilitas/respons";

export const profilController = {
  async lihat(req: Request, res: Response): Promise<void> {
    const pengguna = penggunaWajib(req);
    const data = await profilLayanan.lihat(pengguna.id);
    responsSukses(res, 200, "Profil berhasil diambil.", data);
  },

  async perbarui(req: Request, res: Response): Promise<void> {
    const pengguna = penggunaWajib(req);
    const data = await profilLayanan.perbarui(pengguna.id, req.body);
    responsSukses(res, 200, "Profil berhasil diperbarui.", data);
  },
};
