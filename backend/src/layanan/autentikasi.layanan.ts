import { cariUserBerdasarkanEmail, buatUserViewer } from '../repositori/user.repositori';
import { hashPassword, bandingkanPassword } from '../utilitas/kriptografi';
import { AppError } from '../utilitas/AppError';

// Tipe berisi nama untuk mendeteksi error dengan kode MySQL spesifik
interface MysqlError extends Error {
  code?: string;
}

/**
 * Mendaftarkan pengguna baru.
 * Role selalu 'viewer' untuk mencegah privilege escalation.
 * Validasi panjang password dilakukan di sini (sebelum I/O ke database).
 */
export const registerUser = async (nama: string, email: string, passwordMentah: string) => {
  const emailLower = email.toLowerCase().trim();

  if (passwordMentah.length < 8) {
    throw new AppError('Password minimal 8 karakter', 400);
  }

  let passwordHash: string;
  try {
    passwordHash = await hashPassword(passwordMentah);
  } catch {
    throw new AppError('Gagal memproses password', 500);
  }

  try {
    const userId = await buatUserViewer(nama.trim(), emailLower, passwordHash);
    return { id: userId, nama: nama.trim(), email: emailLower, role: 'viewer' as const };
  } catch (error: unknown) {
    // Menangkap error duplikasi email (kode spesifik MySQL: ER_DUP_ENTRY)
    if ((error as MysqlError).code === 'ER_DUP_ENTRY') {
      throw new AppError('Email sudah terdaftar', 409);
    }
    throw error;
  }
};

/**
 * Memvalidasi kredensial dan mengembalikan profil pengguna tanpa password.
 * Menggunakan pesan error yang sama untuk email tidak ditemukan dan password salah
 * untuk mencegah enumerasi akun (timing-safe message).
 */
export const loginUser = async (email: string, passwordMentah: string) => {
  const emailLower = email.toLowerCase().trim();
  const user = await cariUserBerdasarkanEmail(emailLower);

  // Pesan generik mencegah pembocoran keberadaan email (user enumeration)
  const pesanErrorUmum = 'Email atau password salah';

  if (!user || !user.password) {
    // Tetap jalankan bcrypt dummy untuk mencegah timing attack
    await bandingkanPassword(passwordMentah, '$2b$12$dummy.hash.yang.tidak.akan.cocok.dengan.apapun.xxx');
    throw new AppError(pesanErrorUmum, 401);
  }

  const passwordCocok = await bandingkanPassword(passwordMentah, user.password);
  if (!passwordCocok) {
    throw new AppError(pesanErrorUmum, 401);
  }

  // Kembalikan data user tanpa password
  return {
    id: user.id,
    nama: user.nama,
    email: user.email,
    role: user.role,
  };
};
