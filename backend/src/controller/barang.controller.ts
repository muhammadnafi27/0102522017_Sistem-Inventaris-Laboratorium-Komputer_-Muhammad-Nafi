import type { Request, Response } from "express";

import { barangLayanan } from "@/layanan/barang.layanan";
import type { KondisiBarang } from "@/tipe/basis-data";
import { hapusFotoBarang } from "@/utilitas/berkas";
import { penggunaWajib } from "@/utilitas/pengguna";
import { responsSukses } from "@/utilitas/respons";

export const barangController = {
  async daftar(req: Request, res: Response): Promise<void> {
    // Nilai query sudah disanitasi (toInt/trim) oleh validasiQueryDaftarBarang sebelum sampai di sini.
    const hasil = await barangLayanan.daftar({
      page: req.query.page as unknown as number | undefined,
      limit: req.query.limit as unknown as number | undefined,
      search: req.query.search as string | undefined,
      kategori_id: req.query.kategori_id as unknown as number | undefined,
      kondisi: req.query.kondisi as KondisiBarang | undefined,
      lokasi: req.query.lokasi as string | undefined,
      sort: req.query.sort as string | undefined,
      order: req.query.order as string | undefined,
    });
    responsSukses(res, 200, "Daftar barang berhasil diambil.", hasil.data, hasil.meta);
  },

  async detail(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const barang = await barangLayanan.detail(id);
    responsSukses(res, 200, "Detail barang berhasil diambil.", barang);
  },

  async buat(req: Request, res: Response): Promise<void> {
    const pengguna = penggunaWajib(req);
    try {
      const barang = await barangLayanan.buat(
        { ...req.body, foto: req.file?.filename },
        pengguna.id,
      );
      responsSukses(res, 201, "Barang berhasil ditambahkan.", barang);
    } catch (error) {
      // Bila layanan gagal (mis. kode duplikat/kategori tidak ada) setelah Multer sudah
      // menulis file ke disk, file yatim tersebut wajib dibersihkan agar tidak menumpuk.
      if (req.file) {
        await hapusFotoBarang(req.file.filename);
      }
      throw error;
    }
  },

  async perbarui(req: Request, res: Response): Promise<void> {
    const pengguna = penggunaWajib(req);
    const id = Number(req.params.id);
    try {
      const barang = await barangLayanan.perbarui(
        id,
        { ...req.body, foto: req.file?.filename },
        pengguna.id,
      );
      responsSukses(res, 200, "Barang berhasil diperbarui.", barang);
    } catch (error) {
      // File baru yang sudah terlanjur ditulis Multer dibersihkan; foto lama yang masih
      // aktif TIDAK disentuh karena update database belum tentu berhasil.
      if (req.file) {
        await hapusFotoBarang(req.file.filename);
      }
      throw error;
    }
  },

  async hapus(req: Request, res: Response): Promise<void> {
    const pengguna = penggunaWajib(req);
    const id = Number(req.params.id);
    await barangLayanan.hapus(id, pengguna.id);
    responsSukses(res, 200, "Barang berhasil dihapus.");
  },
};
