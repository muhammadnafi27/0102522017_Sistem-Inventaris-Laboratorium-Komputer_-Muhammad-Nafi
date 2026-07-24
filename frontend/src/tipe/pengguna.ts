// Tipe ini sengaja dijaga konsisten dengan bentuk PenggunaAman pada backend
// (backend/src/tipe/pengguna-aman.ts) agar data dari /auth/me dan /api/users dapat dipakai langsung.
export type RolePengguna = "admin" | "operator" | "viewer";

export interface Pengguna {
  id: number;
  nama: string;
  email: string;
  role: RolePengguna;
  created_at: string;
  updated_at: string;
}
