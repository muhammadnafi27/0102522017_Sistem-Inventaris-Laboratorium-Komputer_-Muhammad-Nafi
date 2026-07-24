// Konsisten dengan ENUM kondisi pada backend (tabel barang) dan BarangDenganKategoriRow.
export type KondisiBarang = "Baik" | "Perlu Perawatan" | "Rusak" | "Tidak Aktif";

// Bentuk barang yang dikembalikan API list/detail - sudah termasuk nama_kategori hasil JOIN
// sehingga tabel dan detail tidak perlu memanggil endpoint kategori terpisah.
export interface Barang {
  id: number;
  kode_barang: string;
  nama_barang: string;
  kategori_id: number;
  kondisi: KondisiBarang;
  lokasi: string;
  jumlah: number;
  foto: string | null;
  nama_kategori: string;
  created_at: string;
  updated_at: string;
}

// Parameter query GET /api/barang. Semua opsional; nilai kosong tidak dikirim ke backend.
export interface FilterBarang {
  page?: number;
  limit?: number;
  search?: string;
  kategori_id?: number;
  kondisi?: KondisiBarang;
  lokasi?: string;
  sort?: string;
  order?: "asc" | "desc";
}

// Nilai form tambah/edit barang di frontend sebelum diubah menjadi FormData saat submit.
export interface NilaiFormBarang {
  kode_barang: string;
  nama_barang: string;
  kategori_id: string;
  kondisi: KondisiBarang;
  lokasi: string;
  jumlah: string;
  // File foto yang dipilih pengguna; null berarti tidak mengubah foto (pada mode edit).
  foto: File | null;
}
