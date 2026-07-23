import jwt, { SignOptions } from 'jsonwebtoken';
import { UserPayload } from '../tipe/autentikasi';
import { CookieOptions } from 'express';

// Nilai yang aman dan terbaca diambil dari env, dengan fallback hanya untuk development
const rahasiaJwt = process.env.JWT_SECRET;
if (!rahasiaJwt) {
  throw new Error('[jwt.ts] JWT_SECRET tidak ditemukan di environment variables. Atur nilai ini di file .env');
}

const opsiSign: SignOptions = {
  // Masa berlaku diambil dari .env, fallback ke 8 jam jika tidak dikonfigurasi
  expiresIn: (process.env.JWT_EXPIRES_IN as SignOptions['expiresIn']) ?? '8h',
};

/**
 * Membuat token akses JWT yang ditandatangani dengan secret dari env.
 * @param payload Data pengguna yang disisipkan ke token (tidak termasuk password)
 * @returns String JWT yang valid
 */
export const buatTokenAkses = (payload: UserPayload): string => {
  // Buat payload bersih: hanya sertakan field yang diperlukan
  const payloadBersih: UserPayload = {
    id: payload.id,
    nama: payload.nama,
    email: payload.email,
    role: payload.role,
  };
  return jwt.sign(payloadBersih, rahasiaJwt, opsiSign);
};

/**
 * Memverifikasi dan mendekode token JWT.
 * Akan melempar error jika token tidak valid atau kadaluarsa.
 * @param token Token JWT dari cookie atau header
 * @returns Payload user yang telah terverifikasi
 */
export const verifikasiTokenAkses = (token: string): UserPayload => {
  return jwt.verify(token, rahasiaJwt) as UserPayload;
};

/**
 * Opsi cookie HttpOnly yang konsisten untuk set dan clear cookie JWT.
 * Secure hanya aktif di production agar bisa diuji via HTTP di development.
 */
export const opsiCookieToken: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
};
