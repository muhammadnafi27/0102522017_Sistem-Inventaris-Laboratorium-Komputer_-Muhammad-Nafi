import type { KondisiBarang } from "@/tipe/barang";

// Daftar kondisi valid + kelas warna badge sesuai token PRD 4.1:
// Baik = hijau, Perlu Perawatan = kuning, Rusak = merah, Tidak Aktif = abu-abu.
export const OPSI_KONDISI: KondisiBarang[] = ["Baik", "Perlu Perawatan", "Rusak", "Tidak Aktif"];

// Kelas untuk badge (background lembut + teks/aksen kuat) agar mudah dibaca di tabel putih.
export const KELAS_BADGE_KONDISI: Record<KondisiBarang, string> = {
  Baik: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20",
  "Perlu Perawatan": "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20",
  Rusak: "bg-red-50 text-red-700 ring-1 ring-red-600/20",
  "Tidak Aktif": "bg-slate-100 text-slate-600 ring-1 ring-slate-500/20",
};

// Warna solid (untuk bar progress distribusi kondisi pada dashboard).
export const WARNA_BAR_KONDISI: Record<KondisiBarang, string> = {
  Baik: "bg-success",
  "Perlu Perawatan": "bg-warning",
  Rusak: "bg-danger",
  "Tidak Aktif": "bg-inactive",
};
