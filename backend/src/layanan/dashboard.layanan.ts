import { barangRepository } from "@/repository/barang.repository";
import { kategoriRepository } from "@/repository/kategori.repository";
import type { BarangDenganKategoriRow, KondisiBarang } from "@/tipe/basis-data";

// Urutan tetap agar distribusiKondisi selalu memuat keempat kondisi (termasuk yang
// jumlahnya 0) dengan urutan tampilan yang konsisten di frontend.
const URUTAN_KONDISI: readonly KondisiBarang[] = ["Baik", "Perlu Perawatan", "Rusak", "Tidak Aktif"];

const BATAS_BARANG_TERBARU = 5;
const BATAS_PERLU_PERHATIAN = 5;

export interface RingkasanDashboard {
  totalBarang: number;
  totalKategori: number;
  kondisiBaik: number;
  perluPerhatian: number;
  distribusiKondisi: { kondisi: KondisiBarang; total: number }[];
  distribusiKategori: { kategori: string; total: number }[];
  barangTerbaru: BarangDenganKategoriRow[];
  daftarPerluPerhatian: BarangDenganKategoriRow[];
}

export const dashboardLayanan = {
  async ringkasan(): Promise<RingkasanDashboard> {
    const [
      totalBarang,
      totalKategori,
      distribusiKondisiMentah,
      distribusiKategoriMentah,
      barangTerbaru,
      daftarPerluPerhatian,
    ] = await Promise.all([
      barangRepository.hitungSemua(),
      kategoriRepository.hitungSemua(),
      barangRepository.hitungPerKondisi(),
      barangRepository.hitungPerKategori(),
      barangRepository.cariTerbaru(BATAS_BARANG_TERBARU),
      barangRepository.cariPerluPerhatian(BATAS_PERLU_PERHATIAN),
    ]);

    // Query GROUP BY hanya mengembalikan kondisi yang benar-benar punya baris; dipetakan
    // dulu agar kondisi tanpa barang tetap tampil dengan total 0 alih-alih hilang dari respons.
    const petaKondisi = new Map(distribusiKondisiMentah.map((baris) => [baris.kondisi, baris.total]));
    const distribusiKondisi = URUTAN_KONDISI.map((kondisi) => ({
      kondisi,
      total: petaKondisi.get(kondisi) ?? 0,
    }));

    const kondisiBaik = petaKondisi.get("Baik") ?? 0;
    const perluPerhatian = (petaKondisi.get("Perlu Perawatan") ?? 0) + (petaKondisi.get("Rusak") ?? 0);

    const distribusiKategori = distribusiKategoriMentah.map((baris) => ({
      kategori: baris.nama_kategori,
      total: baris.total,
    }));

    return {
      totalBarang,
      totalKategori,
      kondisiBaik,
      perluPerhatian,
      distribusiKondisi,
      distribusiKategori,
      barangTerbaru,
      daftarPerluPerhatian,
    };
  },
};
