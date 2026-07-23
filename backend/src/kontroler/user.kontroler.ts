import { Response, NextFunction } from 'express';
import UserLayanan from '../layanan/user.layanan';
import { ParameterPencarianUser } from '../repositori/user.repositori';
import { AppRequest } from '../tipe/autentikasi';

/**
 * GET /api/users
 */
export const dapatkanSemua = async (req: AppRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const params: ParameterPencarianUser = {
      cari: req.query.cari ? String(req.query.cari) : undefined,
      role: (req.query.role && ['admin', 'operator', 'viewer'].includes(String(req.query.role)))
        ? (String(req.query.role) as 'admin' | 'operator' | 'viewer')
        : undefined,
      halaman: req.query.halaman ? parseInt(String(req.query.halaman), 10) : 1,
      batas: req.query.batas ? parseInt(String(req.query.batas), 10) : 10,
      urut: req.query.urut ? String(req.query.urut) : undefined,
      arah: req.query.arah === 'asc' ? 'asc' : 'desc',
    };

    const hasil = await UserLayanan.dapatkanSemua(params);

    res.status(200).json({
      sukses: true,
      pesan: 'Berhasil mengambil daftar pengguna',
      data: hasil.data,
      meta: hasil.meta,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id
 */
export const dapatkanSatu = async (req: AppRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id), 10);

    if (isNaN(id) || id <= 0) {
      res.status(400).json({ sukses: false, pesan: 'ID pengguna tidak valid' });
      return;
    }

    const data = await UserLayanan.dapatkanBerdasarkanId(id);

    res.status(200).json({
      sukses: true,
      pesan: 'Berhasil mengambil detail pengguna',
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/users
 */
export const tambahUser = async (req: AppRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await UserLayanan.buatUser(req.body);

    res.status(201).json({
      sukses: true,
      pesan: 'Berhasil menambahkan pengguna baru',
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/:id
 */
export const perbaruiUser = async (req: AppRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id), 10);

    if (isNaN(id) || id <= 0) {
      res.status(400).json({ sukses: false, pesan: 'ID pengguna tidak valid' });
      return;
    }

    const data = await UserLayanan.perbaruiUser(id, req.body);

    res.status(200).json({
      sukses: true,
      pesan: 'Berhasil memperbarui data pengguna',
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/users/:id
 */
export const hapusUser = async (req: AppRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const idTarget = parseInt(String(req.params.id), 10);

    if (isNaN(idTarget) || idTarget <= 0) {
      res.status(400).json({ sukses: false, pesan: 'ID pengguna tidak valid' });
      return;
    }

    const idAdminLogin = req.user?.id;
    if (!idAdminLogin) {
      res.status(401).json({ sukses: false, pesan: 'Autentikasi tidak valid' });
      return;
    }

    await UserLayanan.hapusUser(idTarget, idAdminLogin);

    res.status(200).json({
      sukses: true,
      pesan: 'Berhasil menghapus pengguna',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/users/:id/reset-password
 */
export const resetPassword = async (req: AppRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const idTarget = parseInt(String(req.params.id), 10);

    if (isNaN(idTarget) || idTarget <= 0) {
      res.status(400).json({ sukses: false, pesan: 'ID pengguna tidak valid' });
      return;
    }

    await UserLayanan.resetPassword(idTarget, req.body);

    res.status(200).json({
      sukses: true,
      pesan: 'Password pengguna berhasil direset. Silakan minta pengguna login dengan password baru.',
    });
  } catch (error) {
    next(error);
  }
};
