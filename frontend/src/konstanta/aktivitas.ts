// Nilai aksi & entitas yang benar-benar dicatat backend (lihat pemanggilan
// aktivitasRepository.catat di seluruh layanan backend) - dipakai untuk opsi filter dropdown
// agar pilihan selalu valid dan tidak pernah menghasilkan daftar kosong karena typo.
export const OPSI_AKSI_AKTIVITAS = ["LOGIN", "CREATE", "UPDATE", "DELETE", "RESET_PASSWORD"] as const;

export const OPSI_ENTITAS_AKTIVITAS = ["auth", "kategori", "barang", "user", "profil"] as const;

// Warna badge aksi agar log lebih mudah dipindai sekilas.
export const KELAS_BADGE_AKSI: Record<string, string> = {
  LOGIN: "bg-slate-100 text-slate-600",
  CREATE: "bg-emerald-50 text-success",
  UPDATE: "bg-blue-50 text-update",
  DELETE: "bg-red-50 text-delete",
  RESET_PASSWORD: "bg-amber-50 text-warning",
};
