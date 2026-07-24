import type { RolePengguna } from "@/tipe/basis-data";

// Bentuk data pengguna aktif yang ditempelkan middleware autentikasi ke req.pengguna.
// Sengaja tidak menyertakan password/reset_token agar tidak ada risiko kebocoran field sensitif
// meskipun suatu saat req.pengguna ikut di-serialize.
export interface PenggunaAktif {
  id: number;
  nama: string;
  email: string;
  role: RolePengguna;
}

declare global {
  namespace Express {
    interface Request {
      pengguna?: PenggunaAktif;
    }
  }
}

export {};
