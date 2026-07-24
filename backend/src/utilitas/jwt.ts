import jwt, { type SignOptions } from "jsonwebtoken";

import { environment } from "@/konfigurasi/environment";
import type { RolePengguna } from "@/tipe/basis-data";

// Isi payload JWT sengaja minimal: id (sub), email, dan role secukupnya untuk otorisasi.
// Password tidak pernah dimasukkan ke payload karena JWT hanya di-encode, bukan dienkripsi.
export interface PayloadToken {
  sub: number;
  email: string;
  role: RolePengguna;
}

// Menandatangani JWT baru. Masa berlaku default 8 jam, atau lebih panjang (7 hari) bila
// pengguna mencentang "Ingat saya" saat login.
export function buatToken(payload: PayloadToken, ingatSaya: boolean): string {
  const masaBerlaku = ingatSaya ? environment.jwt.expiresInIngatSaya : environment.jwt.expiresIn;

  // Cast diperlukan karena tipe StringValue dari package "ms" lebih ketat daripada
  // string biasa; format durasi (mis. "8h", "7d") sudah ditentukan lewat .env.
  const opsi: SignOptions = { expiresIn: masaBerlaku as SignOptions["expiresIn"] };

  return jwt.sign(payload, environment.jwt.secret, opsi);
}

// Memverifikasi dan mendekode JWT. Melempar TokenExpiredError/JsonWebTokenError bawaan
// library bila token tidak valid - ditangkap secara spesifik oleh middleware autentikasi.
// Hasil decode jwt.verify bertipe longgar (string | JwtPayload) sehingga di-cast lewat
// unknown; bentuk payload sudah kita kendalikan sendiri sejak buatToken() menandatanganinya.
export function verifikasiToken(token: string): PayloadToken {
  return jwt.verify(token, environment.jwt.secret) as unknown as PayloadToken;
}
