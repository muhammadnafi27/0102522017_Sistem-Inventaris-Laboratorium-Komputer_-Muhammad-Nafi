import type { Request, Response } from "express";

import { dashboardLayanan } from "@/layanan/dashboard.layanan";
import { responsSukses } from "@/utilitas/respons";

export const dashboardController = {
  async ringkasan(_req: Request, res: Response): Promise<void> {
    const data = await dashboardLayanan.ringkasan();
    responsSukses(res, 200, "Ringkasan dashboard berhasil diambil.", data);
  },
};
