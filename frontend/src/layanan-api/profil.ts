import { permintaanApi } from "@/layanan-api/klien";
import type { Pengguna } from "@/tipe/pengguna";

export interface NilaiFormProfil {
  nama: string;
  email?: string;
}

export async function ambilProfil(): Promise<Pengguna> {
  const hasil = await permintaanApi<Pengguna>("/profil");
  return hasil.data;
}

export async function perbaruiProfil(nilai: NilaiFormProfil): Promise<Pengguna> {
  const hasil = await permintaanApi<Pengguna>("/profil", { method: "PUT", body: nilai });
  return hasil.data;
}
