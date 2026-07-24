import type { Request, Response } from "express";

import { userLayanan } from "@/layanan/user.layanan";
import type { RolePengguna } from "@/tipe/basis-data";
import { penggunaWajib } from "@/utilitas/pengguna";
import { responsSukses } from "@/utilitas/respons";

export const userController = {
  async daftar(req: Request, res: Response): Promise<void> {
    const hasil = await userLayanan.daftar({
      page: req.query.page as unknown as number | undefined,
      limit: req.query.limit as unknown as number | undefined,
      search: req.query.search as string | undefined,
      role: req.query.role as RolePengguna | undefined,
    });
    responsSukses(res, 200, "Daftar pengguna berhasil diambil.", hasil.data, hasil.meta);
  },

  async detail(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const data = await userLayanan.detail(id);
    responsSukses(res, 200, "Detail pengguna berhasil diambil.", data);
  },

  async buat(req: Request, res: Response): Promise<void> {
    const pengguna = penggunaWajib(req);
    const data = await userLayanan.buat(req.body, pengguna.id);
    responsSukses(res, 201, "Pengguna berhasil ditambahkan.", data);
  },

  async perbarui(req: Request, res: Response): Promise<void> {
    const pengguna = penggunaWajib(req);
    const id = Number(req.params.id);
    const data = await userLayanan.perbarui(id, req.body, pengguna.id);
    responsSukses(res, 200, "Pengguna berhasil diperbarui.", data);
  },

  async hapus(req: Request, res: Response): Promise<void> {
    const pengguna = penggunaWajib(req);
    const id = Number(req.params.id);
    await userLayanan.hapus(id, pengguna.id);
    responsSukses(res, 200, "Pengguna berhasil dihapus.");
  },

  async resetPassword(req: Request, res: Response): Promise<void> {
    const pengguna = penggunaWajib(req);
    const id = Number(req.params.id);
    await userLayanan.resetPassword(id, req.body, pengguna.id);
    responsSukses(res, 200, "Password pengguna berhasil direset.");
  },
};
