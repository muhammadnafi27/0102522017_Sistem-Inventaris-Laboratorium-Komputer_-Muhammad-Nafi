// Bentuk kategori dari GET /api/kategori - termasuk jumlah_barang hasil agregasi backend.
export interface Kategori {
  id: number;
  nama_kategori: string;
  deskripsi: string | null;
  jumlah_barang: number;
  created_at: string;
  updated_at: string;
}
