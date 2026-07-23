import { Request, Response, NextFunction } from 'express';
import KategoriLayanan from '../layanan/kategori.layanan';

/**
 * GET /api/kategori
 */
export const dapatkanSemua = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await KategoriLayanan.dapatkanSemuaKategori();
    res.status(200).json({
      sukses: true,
      pesan: 'Berhasil mengambil daftar kategori',
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/kategori/:id
 */
export const dapatkanSatu = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const data = await KategoriLayanan.dapatkanKategoriBerdasarkanId(id);
    res.status(200).json({
      sukses: true,
      pesan: 'Berhasil mengambil detail kategori',
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/kategori
 */
export const tambahKategori = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await KategoriLayanan.buatKategori(req.body);
    res.status(201).json({
      sukses: true,
      pesan: 'Berhasil menambahkan kategori',
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/kategori/:id
 */
export const perbaruiKategori = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const data = await KategoriLayanan.perbaruiKategori(id, req.body);
    res.status(200).json({
      sukses: true,
      pesan: 'Berhasil memperbarui kategori',
      data
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/kategori/:id
 */
export const hapusKategori = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id), 10);
    await KategoriLayanan.hapusKategori(id);
    res.status(200).json({
      sukses: true,
      pesan: 'Berhasil menghapus kategori'
    });
  } catch (error) {
    next(error);
  }
};
