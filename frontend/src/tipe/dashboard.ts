import type { Barang, KondisiBarang } from "@/tipe/barang";

// Bentuk respons GET /api/dashboard - konsisten dengan RingkasanDashboard pada backend
// (backend/src/layanan/dashboard.layanan.ts).
export interface RingkasanDashboard {
  totalBarang: number;
  totalKategori: number;
  kondisiBaik: number;
  perluPerhatian: number;
  distribusiKondisi: { kondisi: KondisiBarang; total: number }[];
  distribusiKategori: { kategori: string; total: number }[];
  barangTerbaru: Barang[];
  daftarPerluPerhatian: Barang[];
}
