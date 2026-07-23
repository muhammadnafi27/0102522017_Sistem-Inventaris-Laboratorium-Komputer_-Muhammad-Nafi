import { Router } from 'express';
import {
  dapatkanSemua,
  dapatkanSatu,
  tambahKategori,
  perbaruiKategori,
  hapusKategori
} from '../kontroler/kategori.kontroler';
import { autentikasi } from '../middleware/autentikasi.middleware';
import { izinkanRole } from '../middleware/role.middleware';

const router = Router();

// Semua rute kategori membutuhkan login (autentikasi)
router.use(autentikasi);

// Viewer, Operator, Admin: Bisa baca
router.get('/', dapatkanSemua);
router.get('/:id', dapatkanSatu);

// Operator, Admin: Bisa tambah & edit
router.post('/', izinkanRole('admin', 'operator'), tambahKategori);
router.put('/:id', izinkanRole('admin', 'operator'), perbaruiKategori);

// Hanya Admin: Bisa hapus
router.delete('/:id', izinkanRole('admin'), hapusKategori);

export default router;
