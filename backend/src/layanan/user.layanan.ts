import bcrypt from 'bcrypt';
import {
  cariUserBerdasarkanEmail,
  cariUserBerdasarkanId,
  dapatkanSemuaUser,
  buatUserOlehAdmin,
  perbaruiUserByAdmin,
  perbaruiPasswordUser,
  hapusUserById,
  hitungJumlahAdmin,
  ParameterPencarianUser,
  HasilPaginasiUser,
  UserPublic,
} from '../repositori/user.repositori';
import { AppError } from '../utilitas/AppError';
import { skemaBuatUser, skemaEditUser, skemaResetPassword } from '../validasi/user.validasi';

const BCRYPT_SALT_ROUNDS = 12;

class UserLayanan {
  async dapatkanSemua(params: ParameterPencarianUser): Promise<HasilPaginasiUser> {
    return await dapatkanSemuaUser(params);
  }

  async dapatkanBerdasarkanId(id: number): Promise<UserPublic> {
    const user = await cariUserBerdasarkanId(id);
    if (!user) {
      throw new AppError('Pengguna tidak ditemukan', 404);
    }
    return {
      id: user.id,
      nama: user.nama,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  async buatUser(data: unknown): Promise<UserPublic> {
    const hasilValidasi = skemaBuatUser.safeParse(data);
    if (!hasilValidasi.success) {
      const pesanError = hasilValidasi.error.issues.map(err => err.message).join(', ');
      throw new AppError(pesanError, 400);
    }

    const { nama, email, password, role } = hasilValidasi.data;

    // Cek keunikan email
    const emailAda = await cariUserBerdasarkanEmail(email);
    if (emailAda) {
      throw new AppError('Email sudah terdaftar dalam sistem', 409);
    }

    // Hash password bcrypt cost 12
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    const idBaru = await buatUserOlehAdmin(nama, email, passwordHash, role);

    console.log(`[USER-AUDIT] Admin membuat akun baru: ID=${idBaru}, Email=${email}, Role=${role}`);

    return await this.dapatkanBerdasarkanId(idBaru);
  }

  async perbaruiUser(id: number, data: unknown): Promise<UserPublic> {
    const userTarget = await cariUserBerdasarkanId(id);
    if (!userTarget) {
      throw new AppError('Pengguna tidak ditemukan', 404);
    }

    const hasilValidasi = skemaEditUser.safeParse(data);
    if (!hasilValidasi.success) {
      const pesanError = hasilValidasi.error.issues.map(err => err.message).join(', ');
      throw new AppError(pesanError, 400);
    }

    const { nama, email, role } = hasilValidasi.data;

    // Cek duplikasi email (jika diubah ke email user lain)
    const emailAda = await cariUserBerdasarkanEmail(email);
    if (emailAda && emailAda.id !== id) {
      throw new AppError('Email sudah digunakan oleh pengguna lain', 409);
    }

    // Proteksi Keamanan Admin Terakhir: Jika role diubah dari admin ke role lain
    if (userTarget.role === 'admin' && role !== 'admin') {
      const jumlahAdmin = await hitungJumlahAdmin();
      if (jumlahAdmin <= 1) {
        throw new AppError('Perubahan role ditolak. Sistem harus memiliki minimal satu admin aktif.', 409);
      }
    }

    await perbaruiUserByAdmin(id, nama, email, role);

    console.log(`[USER-AUDIT] Admin memperbarui akun: ID=${id}, Email=${email}, RoleBaru=${role}`);

    return await this.dapatkanBerdasarkanId(id);
  }

  async hapusUser(idTarget: number, idAdminLogin: number): Promise<void> {
    // Proteksi 1: Larangan menghapus diri sendiri
    if (idTarget === idAdminLogin) {
      throw new AppError('Anda tidak dapat menghapus akun Anda sendiri', 400);
    }

    const userTarget = await cariUserBerdasarkanId(idTarget);
    if (!userTarget) {
      throw new AppError('Pengguna tidak ditemukan', 404);
    }

    // Proteksi 2: Larangan menghapus admin terakhir
    if (userTarget.role === 'admin') {
      const jumlahAdmin = await hitungJumlahAdmin();
      if (jumlahAdmin <= 1) {
        throw new AppError('Penghapusan ditolak. Tidak dapat menghapus admin terakhir dalam sistem.', 409);
      }
    }

    await hapusUserById(idTarget);

    console.log(`[USER-AUDIT] Admin (ID=${idAdminLogin}) menghapus akun ID=${idTarget} (${userTarget.email})`);
  }

  async resetPassword(idTarget: number, data: unknown): Promise<void> {
    const userTarget = await cariUserBerdasarkanId(idTarget);
    if (!userTarget) {
      throw new AppError('Pengguna tidak ditemukan', 404);
    }

    const hasilValidasi = skemaResetPassword.safeParse(data);
    if (!hasilValidasi.success) {
      const pesanError = hasilValidasi.error.issues.map(err => err.message).join(', ');
      throw new AppError(pesanError, 400);
    }

    const { password_baru } = hasilValidasi.data;

    // Hash password baru cost 12
    const passwordHash = await bcrypt.hash(password_baru, BCRYPT_SALT_ROUNDS);

    await perbaruiPasswordUser(idTarget, passwordHash);

    console.log(`[USER-SECURITY] Password untuk user ID=${idTarget} (${userTarget.email}) berhasil direset oleh Admin`);
  }
}

export default new UserLayanan();
