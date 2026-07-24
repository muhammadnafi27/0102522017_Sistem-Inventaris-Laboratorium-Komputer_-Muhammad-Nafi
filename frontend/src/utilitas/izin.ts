import type { Pengguna, RolePengguna } from "@/tipe/pengguna";

// Helper izin ringan untuk keputusan TAMPILAN saja (menyembunyikan tombol/menu yang tidak
// relevan bagi role pengguna). Ini BUKAN mekanisme keamanan - backend tetap menjadi otoritas
// akhir lewat middleware authorizeRoles karena endpoint API selalu bisa dipanggil langsung
// tanpa melalui UI ini (mis. lewat curl/Postman).
export function bolehAkses(pengguna: Pengguna | null, rolesDiizinkan: RolePengguna[]): boolean {
  return pengguna !== null && rolesDiizinkan.includes(pengguna.role);
}
