import { aktivitasRepository } from "@/repository/aktivitas.repository";
import { kategoriRepository } from "@/repository/kategori.repository";
import type { KategoriBarangRow, KategoriDenganJumlahRow } from "@/tipe/basis-data";
import { KesalahanAplikasi } from "@/tipe/kesalahan-aplikasi";
import { jalankanTransaksi } from "@/utilitas/transaksi";

export interface DataKategoriMasuk {
  nama_kategori: string;
  deskripsi?: string | null;
}

export const kategoriLayanan = {
  async daftarSemua(): Promise<KategoriDenganJumlahRow[]> {
    return kategoriRepository.cariSemuaDenganJumlahBarang();
  },

  async buat(data: DataKategoriMasuk, penggunaId: number): Promise<KategoriBarangRow> {
    const namaKategori = data.nama_kategori.trim();
    const deskripsi = data.deskripsi?.trim() || null;

    const sudahAda = await kategoriRepository.cariByNama(namaKategori);
    if (sudahAda) {
      throw new KesalahanAplikasi(409, "Nama kategori sudah digunakan.", [
        { field: "nama_kategori", pesan: "Nama kategori sudah digunakan." },
      ]);
    }

    const id = await jalankanTransaksi(async (koneksi) => {
      const idBaru = await kategoriRepository.buat({ nama_kategori: namaKategori, deskripsi }, koneksi);
      await aktivitasRepository.catat(
        {
          user_id: penggunaId,
          aksi: "CREATE",
          entitas: "kategori",
          entitas_id: idBaru,
          detail: `Menambahkan kategori "${namaKategori}".`,
          ip_address: null,
        },
        koneksi,
      );
      return idBaru;
    });

    const baris = await kategoriRepository.cariById(id);
    if (!baris) {
      throw new KesalahanAplikasi(500, "Gagal membuat kategori. Silakan coba lagi.");
    }
    return baris;
  },

  async perbarui(id: number, data: DataKategoriMasuk, penggunaId: number): Promise<KategoriBarangRow> {
    const existing = await kategoriRepository.cariById(id);
    if (!existing) {
      throw new KesalahanAplikasi(404, "Kategori tidak ditemukan.");
    }

    const namaKategori = data.nama_kategori.trim();
    const deskripsi = data.deskripsi?.trim() || null;

    const duplikat = await kategoriRepository.cariByNama(namaKategori);
    if (duplikat && duplikat.id !== id) {
      throw new KesalahanAplikasi(409, "Nama kategori sudah digunakan.", [
        { field: "nama_kategori", pesan: "Nama kategori sudah digunakan." },
      ]);
    }

    await jalankanTransaksi(async (koneksi) => {
      await kategoriRepository.perbarui(id, { nama_kategori: namaKategori, deskripsi }, koneksi);
      await aktivitasRepository.catat(
        {
          user_id: penggunaId,
          aksi: "UPDATE",
          entitas: "kategori",
          entitas_id: id,
          detail: `Memperbarui kategori "${namaKategori}".`,
          ip_address: null,
        },
        koneksi,
      );
    });

    const baris = await kategoriRepository.cariById(id);
    if (!baris) {
      throw new KesalahanAplikasi(500, "Gagal memperbarui kategori. Silakan coba lagi.");
    }
    return baris;
  },

  async hapus(id: number, penggunaId: number): Promise<void> {
    const existing = await kategoriRepository.cariById(id);
    if (!existing) {
      throw new KesalahanAplikasi(404, "Kategori tidak ditemukan.");
    }

    const jumlahBarang = await kategoriRepository.hitungBarangTerpakai(id);
    if (jumlahBarang > 0) {
      throw new KesalahanAplikasi(
        409,
        `Kategori "${existing.nama_kategori}" masih dipakai oleh ${jumlahBarang} barang dan tidak dapat dihapus.`,
      );
    }

    await jalankanTransaksi(async (koneksi) => {
      await kategoriRepository.hapus(id, koneksi);
      await aktivitasRepository.catat(
        {
          user_id: penggunaId,
          aksi: "DELETE",
          entitas: "kategori",
          entitas_id: id,
          detail: `Menghapus kategori "${existing.nama_kategori}".`,
          ip_address: null,
        },
        koneksi,
      );
    });
  },
};
