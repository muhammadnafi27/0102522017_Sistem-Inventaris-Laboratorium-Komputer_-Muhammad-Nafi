import { Router } from 'express';
import {
  dapatkanSemua,
  dapatkanSatu,
  tambahUser,
  perbaruiUser,
  hapusUser,
  resetPassword,
} from '../kontroler/user.kontroler';
import { autentikasi } from '../middleware/autentikasi.middleware';
import { izinkanRole } from '../middleware/role.middleware';

const router = Router();

// HAK AKSES MUTLAK: Seluruh /api/users wajib autentikasi dan role ADMIN
router.use(autentikasi);
router.use(izinkanRole('admin'));

router.get('/', dapatkanSemua);
router.get('/:id', dapatkanSatu);
router.post('/', tambahUser);
router.put('/:id', perbaruiUser);
router.delete('/:id', hapusUser);
router.post('/:id/reset-password', resetPassword);

export default router;
