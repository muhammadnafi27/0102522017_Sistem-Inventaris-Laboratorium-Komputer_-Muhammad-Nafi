"use client";

import { useAuth } from "@/konteks/auth-konteks";
import type { RolePengguna } from "@/tipe/pengguna";

interface PropsRoleGuard {
  roles: RolePengguna[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// RoleGuard HANYA mengatur apa yang ditampilkan di UI (menu, tombol, isi halaman) berdasarkan
// role pengguna yang sedang login. ATURAN INI BUKAN keamanan sesungguhnya - backend tetap wajib
// menolak request lewat middleware authorizeRoles, karena endpoint API selalu bisa dipanggil
// langsung tanpa melewati komponen ini (mis. lewat curl/Postman/DevTools).
export function RoleGuard({ roles, children, fallback = null }: PropsRoleGuard) {
  const { pengguna } = useAuth();

  if (!pengguna || !roles.includes(pengguna.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
