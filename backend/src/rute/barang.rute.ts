import { Router } from 'express';
import {
  dapatkanSemua,
  dapatkanSatu,
  tambahBarang,
  perbaruiBarang,
  hapusBarang
} from '../kontroler/barang.kontroler';
import { autentikasi } from '../middleware/autentikasi.middleware';
import { izinkanRole } from '../middleware/role.middleware';
import { uploadBarang } from '../utilitas/upload';

const router = Router();

// Semua rute barang membutuhkan login
router.use(autentikasi);

// Viewer, Operator, Admin: Bisa baca
router.get('/', dapatkanSemua);
router.get('/:id', dapatkanSatu);

// Operator, Admin: Bisa tambah & edit dengan upload foto
router.post(
  '/', 
  izinkanRole('admin', 'operator'), 
  uploadBarang.single('foto'), 
  tambahBarang
);

router.put(
  '/:id', 
  izinkanRole('admin', 'operator'), 
  uploadBarang.single('foto'), 
  perbaruiBarang
);

// Hanya Admin: Bisa hapus
router.delete('/:id', izinkanRole('admin'), hapusBarang);

export default router;
