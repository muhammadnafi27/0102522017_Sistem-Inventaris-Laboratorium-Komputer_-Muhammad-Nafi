import type { Request, Response } from "express";

import { kategoriLayanan } from "@/layanan/kategori.layanan";
import { penggunaWajib } from "@/utilitas/pengguna";
import { responsSukses } from "@/utilitas/respons";

// Controller tipis: membaca request, memanggil layanan, membentuk respons HTTP.
export const kategoriController = {
  async daftar(_req: Request, res: Response): Promise<void> {
    const data = await kategoriLayanan.daftarSemua();
    responsSukses(res, 200, "Daftar kategori berhasil diambil.", data);
  },

  async buat(req: Request, res: Response): Promise<void> {
    const pengguna = penggunaWajib(req);
    const kategori = await kategoriLayanan.buat(req.body, pengguna.id);
    responsSukses(res, 201, "Kategori berhasil ditambahkan.", kategori);
  },

  async perbarui(req: Request, res: Response): Promise<void> {
    const pengguna = penggunaWajib(req);
    const id = Number(req.params.id);
    const kategori = await kategoriLayanan.perbarui(id, req.body, pengguna.id);
    responsSukses(res, 200, "Kategori berhasil diperbarui.", kategori);
  },

  async hapus(req: Request, res: Response): Promise<void> {
    const pengguna = penggunaWajib(req);
    const id = Number(req.params.id);
    await kategoriLayanan.hapus(id, pengguna.id);
    responsSukses(res, 200, "Kategori berhasil dihapus.");
  },
};
