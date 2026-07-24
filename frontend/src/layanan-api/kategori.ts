import { permintaanApi } from "@/layanan-api/klien";
import type { Kategori } from "@/tipe/kategori";

export async function daftarKategori(): Promise<Kategori[]> {
  const hasil = await permintaanApi<Kategori[]>("/kategori");
  return hasil.data;
}
