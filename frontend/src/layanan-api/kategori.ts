import { permintaanApi } from "@/layanan-api/klien";
import type { Kategori } from "@/tipe/kategori";

export interface NilaiFormKategori {
  nama_kategori: string;
  deskripsi: string;
}

export async function daftarKategori(): Promise<Kategori[]> {
  const hasil = await permintaanApi<Kategori[]>("/kategori");
  return hasil.data;
}

export async function buatKategori(nilai: NilaiFormKategori): Promise<Kategori> {
  const hasil = await permintaanApi<Kategori>("/kategori", { method: "POST", body: nilai });
  return hasil.data;
}

export async function perbaruiKategori(id: number, nilai: NilaiFormKategori): Promise<Kategori> {
  const hasil = await permintaanApi<Kategori>(`/kategori/${id}`, { method: "PUT", body: nilai });
  return hasil.data;
}

export async function hapusKategori(id: number): Promise<void> {
  await permintaanApi(`/kategori/${id}`, { method: "DELETE" });
}
