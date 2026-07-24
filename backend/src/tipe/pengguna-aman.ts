import type { RolePengguna, UserRow } from "@/tipe/basis-data";

// Bentuk data pengguna yang aman dikirim ke client - tanpa password/reset_token.
// Dipakai bersama oleh modul auth, manajemen user, dan profil agar bentuknya konsisten.
export interface PenggunaAman {
  id: number;
  nama: string;
  email: string;
  role: RolePengguna;
  created_at: string;
  updated_at: string;
}

export function keAmanPengguna(baris: UserRow): PenggunaAman {
  return {
    id: baris.id,
    nama: baris.nama,
    email: baris.email,
    role: baris.role,
    created_at: baris.created_at,
    updated_at: baris.updated_at,
  };
}
