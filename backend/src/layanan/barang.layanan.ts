import { NAMA_FOTO_DEFAULT } from "@/konfigurasi/unggahan";
import { aktivitasRepository } from "@/repository/aktivitas.repository";
import {
  barangRepository,
  KOLOM_SORT_BARANG,
  type KolomSortBarang,
} from "@/repository/barang.repository";
import { kategoriRepository } from "@/repository/kategori.repository";
import type { BarangDenganKategoriRow, KondisiBarang } from "@/tipe/basis-data";
import { KesalahanAplikasi } from "@/tipe/kesalahan-aplikasi";
import { hapusFotoBarang } from "@/utilitas/berkas";
import type { MetaPagination } from "@/utilitas/respons";
import { jalankanTransaksi } from "@/utilitas/transaksi";

export interface QueryDaftarBarang {
  page?: number;
  limit?: number;
  search?: string;
  kategori_id?: number;
  kondisi?: KondisiBarang;
  lokasi?: string;
  sort?: string;
  order?: string;
}

export interface DataBarangMasuk {
  kode_barang: string;
  nama_barang: string;
  kategori_id: number;
  kondisi: KondisiBarang;
  lokasi: string;
  jumlah: number;
  foto?: string | null;
}

const BATAS_DEFAULT = 10;
const BATAS_MAKSIMUM = 100;

function pastikanKolomSort(nilai: string | undefined): KolomSortBarang {
  if (nilai && (KOLOM_SORT_BARANG as readonly string[]).includes(nilai)) {
    return nilai as KolomSortBarang;
  }
  return "created_at";
}

function pastikanArahSort(nilai: string | undefined): "ASC" | "DESC" {
  return nilai?.toUpperCase() === "ASC" ? "ASC" : "DESC";
}

// Memastikan kategori_id yang dikirim benar-benar merujuk kategori yang masih tersedia.
// Dipisah agar dipakai baik oleh buat() maupun perbarui().
async function pastikanKategoriTersedia(kategoriId: number): Promise<void> {
  const kategori = await kategoriRepository.cariById(kategoriId);
  if (!kategori) {
    throw new KesalahanAplikasi(422, "Kategori tidak ditemukan.", [
      { field: "kategori_id", pesan: "Kategori yang dipilih tidak ditemukan." },
    ]);
  }
}

export const barangLayanan = {
  async daftar(
    query: QueryDaftarBarang,
  ): Promise<{ data: BarangDenganKategoriRow[]; meta: MetaPagination }> {
    const halaman = Math.max(1, query.page ?? 1);
    const batas = Math.min(BATAS_MAKSIMUM, Math.max(1, query.limit ?? BATAS_DEFAULT));

    const filter = {
      search: query.search?.trim() || undefined,
      kategoriId: query.kategori_id,
      kondisi: query.kondisi,
      lokasi: query.lokasi?.trim() || undefined,
    };

    const kolomSort = pastikanKolomSort(query.sort);
    const arahSort = pastikanArahSort(query.order);

    const [data, totalData] = await Promise.all([
      barangRepository.cariDenganFilter({ ...filter, halaman, batas, kolomSort, arahSort }),
      barangRepository.hitungDenganFilter(filter),
    ]);

    const totalHalaman = totalData === 0 ? 1 : Math.ceil(totalData / batas);

    return { data, meta: { halaman, batas, totalData, totalHalaman } };
  },

  async detail(id: number): Promise<BarangDenganKategoriRow> {
    const baris = await barangRepository.cariByIdDenganKategori(id);
    if (!baris) {
      throw new KesalahanAplikasi(404, "Barang tidak ditemukan.");
    }
    return baris;
  },

  async daftarLokasi(): Promise<string[]> {
    return barangRepository.cariDistinctLokasi();
  },

  async buat(data: DataBarangMasuk, penggunaId: number): Promise<BarangDenganKategoriRow> {
    const kodeBarang = data.kode_barang.trim().toUpperCase();

    await pastikanKategoriTersedia(data.kategori_id);

    const kodeSudahAda = await barangRepository.cariByKode(kodeBarang);
    if (kodeSudahAda) {
      throw new KesalahanAplikasi(409, "Kode barang sudah digunakan.", [
        { field: "kode_barang", pesan: "Kode barang sudah digunakan." },
      ]);
    }

    const id = await jalankanTransaksi(async (koneksi) => {
      const idBaru = await barangRepository.buat(
        {
          kode_barang: kodeBarang,
          nama_barang: data.nama_barang.trim(),
          kategori_id: data.kategori_id,
          kondisi: data.kondisi,
          lokasi: data.lokasi.trim(),
          jumlah: data.jumlah,
          foto: data.foto?.trim() || NAMA_FOTO_DEFAULT,
        },
        koneksi,
      );

      await aktivitasRepository.catat(
        {
          user_id: penggunaId,
          aksi: "CREATE",
          entitas: "barang",
          entitas_id: idBaru,
          detail: `Menambahkan barang ${kodeBarang}.`,
          ip_address: null,
        },
        koneksi,
      );

      return idBaru;
    });

    return this.detail(id);
  },

  async perbarui(
    id: number,
    data: DataBarangMasuk,
    penggunaId: number,
  ): Promise<BarangDenganKategoriRow> {
    const existing = await barangRepository.cariById(id);
    if (!existing) {
      throw new KesalahanAplikasi(404, "Barang tidak ditemukan.");
    }

    await pastikanKategoriTersedia(data.kategori_id);

    const kodeBarang = data.kode_barang.trim().toUpperCase();
    const kodeSudahAda = await barangRepository.cariByKode(kodeBarang);
    if (kodeSudahAda && kodeSudahAda.id !== id) {
      throw new KesalahanAplikasi(409, "Kode barang sudah digunakan.", [
        { field: "kode_barang", pesan: "Kode barang sudah digunakan." },
      ]);
    }

    // Foto hanya diganti bila dikirim (baik lewat upload baru maupun override manual);
    // bila tidak dikirim, foto lama tetap dipertahankan.
    const fotoBaru = data.foto?.trim() || existing.foto;

    await jalankanTransaksi(async (koneksi) => {
      await barangRepository.perbarui(
        id,
        {
          kode_barang: kodeBarang,
          nama_barang: data.nama_barang.trim(),
          kategori_id: data.kategori_id,
          kondisi: data.kondisi,
          lokasi: data.lokasi.trim(),
          jumlah: data.jumlah,
          foto: fotoBaru,
        },
        koneksi,
      );

      await aktivitasRepository.catat(
        {
          user_id: penggunaId,
          aksi: "UPDATE",
          entitas: "barang",
          entitas_id: id,
          detail: `Memperbarui barang ${kodeBarang}.`,
          ip_address: null,
        },
        koneksi,
      );
    });

    // File foto lama dihapus HANYA setelah update database sukses, dan hanya bila memang
    // diganti dengan file baru yang berbeda - mencegah foto masih dipakai baris lain terhapus
    // serta mencegah data hilang bila transaksi database di atas gagal.
    if (fotoBaru !== existing.foto) {
      await hapusFotoBarang(existing.foto);
    }

    return this.detail(id);
  },

  async hapus(id: number, penggunaId: number): Promise<void> {
    const existing = await barangRepository.cariById(id);
    if (!existing) {
      throw new KesalahanAplikasi(404, "Barang tidak ditemukan.");
    }

    await jalankanTransaksi(async (koneksi) => {
      await barangRepository.hapus(id, koneksi);
      await aktivitasRepository.catat(
        {
          user_id: penggunaId,
          aksi: "DELETE",
          entitas: "barang",
          entitas_id: id,
          detail: `Menghapus barang ${existing.kode_barang}.`,
          ip_address: null,
        },
        koneksi,
      );
    });

    // Foto non-default dihapus setelah baris barang berhasil dihapus dari database.
    await hapusFotoBarang(existing.foto);
  },
};
