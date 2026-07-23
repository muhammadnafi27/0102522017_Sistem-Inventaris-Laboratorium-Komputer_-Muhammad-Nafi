import { Request, Response, NextFunction } from 'express';
import BarangLayanan from '../layanan/barang.layanan';
import { ParameterPencarianBarang, DataBarang } from '../repositori/barang.repositori';
import path from 'path';

/**
 * Memformat objek barang agar field `foto` menjadi URL lengkap.
 * Tidak memutasi objek asli — mengembalikan salinan baru agar data DB tidak terkontaminasi.
 */
const formatResponBarang = (req: Request, barang: DataBarang): DataBarang => {
  if (!barang.foto) return barang;

  const protokol = req.protocol;
  const host = req.get('host') ?? 'localhost';
  // Normalisasi path: ganti backslash Windows menjadi forward slash untuk URL
  const fotoPath = barang.foto.split(path.sep).join('/');

  // Gunakan Object.assign ke objek kosong agar tidak memutasi data asli dari DB
  return Object.assign({}, barang, {
    foto: `${protokol}://${host}/${fotoPath}`,
  });
};

/**
 * GET /api/barang
 * Mendukung query params: cari, kategori_id, kondisi, halaman, batas, urut, arah
 */
export const dapatkanSemua = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const params: ParameterPencarianBarang = {
      cari: req.query.cari ? String(req.query.cari) : undefined,
      kategori_id: req.query.kategori_id ? parseInt(String(req.query.kategori_id), 10) : undefined,
      kondisi: req.query.kondisi ? String(req.query.kondisi) : undefined,
      halaman: req.query.halaman ? parseInt(String(req.query.halaman), 10) : 1,
      batas: req.query.batas ? parseInt(String(req.query.batas), 10) : 10,
      urut: req.query.urut ? String(req.query.urut) : undefined,
      arah: req.query.arah === 'asc' ? 'asc' : 'desc',
    };

    const hasil = await BarangLayanan.dapatkanSemuaBarang(params);

    res.status(200).json({
      sukses: true,
      pesan: 'Berhasil mengambil daftar barang',
      data: hasil.data.map(b => formatResponBarang(req, b)),
      meta: hasil.meta,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/barang/:id
 */
export const dapatkanSatu = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id), 10);

    if (isNaN(id) || id <= 0) {
      res.status(400).json({ sukses: false, pesan: 'ID barang tidak valid' });
      return;
    }

    const data = await BarangLayanan.dapatkanBarangBerdasarkanId(id);

    res.status(200).json({
      sukses: true,
      pesan: 'Berhasil mengambil detail barang',
      data: formatResponBarang(req, data),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/barang
 * Mendukung upload foto via field `foto` (multipart/form-data)
 */
export const tambahBarang = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pathFoto = req.file
      ? path.join('unggahan', 'barang', req.file.filename)
      : undefined;

    const data = await BarangLayanan.buatBarang(req.body, pathFoto);

    res.status(201).json({
      sukses: true,
      pesan: 'Berhasil menambahkan barang',
      data: formatResponBarang(req, data),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/barang/:id
 * Mendukung penggantian foto via field `foto` (opsional)
 */
export const perbaruiBarang = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id), 10);

    if (isNaN(id) || id <= 0) {
      res.status(400).json({ sukses: false, pesan: 'ID barang tidak valid' });
      return;
    }

    const pathFotoBaru = req.file
      ? path.join('unggahan', 'barang', req.file.filename)
      : undefined;

    const data = await BarangLayanan.perbaruiBarang(id, req.body, pathFotoBaru);

    res.status(200).json({
      sukses: true,
      pesan: 'Berhasil memperbarui barang',
      data: formatResponBarang(req, data),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/barang/:id
 */
export const hapusBarang = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id), 10);

    if (isNaN(id) || id <= 0) {
      res.status(400).json({ sukses: false, pesan: 'ID barang tidak valid' });
      return;
    }

    await BarangLayanan.hapusBarang(id);

    res.status(200).json({
      sukses: true,
      pesan: 'Berhasil menghapus barang',
    });
  } catch (error) {
    next(error);
  }
};
