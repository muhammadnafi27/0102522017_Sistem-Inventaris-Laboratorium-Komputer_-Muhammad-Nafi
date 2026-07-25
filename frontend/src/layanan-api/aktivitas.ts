import { permintaanApi } from "@/layanan-api/klien";
import type { Aktivitas, FilterAktivitas } from "@/tipe/aktivitas";
import type { MetaPagination } from "@/tipe/respons-api";

export async function daftarAktivitas(
  filter: FilterAktivitas,
): Promise<{ data: Aktivitas[]; meta?: MetaPagination }> {
  const hasil = await permintaanApi<Aktivitas[]>("/aktivitas", {
    query: {
      page: filter.page,
      limit: filter.limit,
      aksi: filter.aksi,
      entitas: filter.entitas,
    },
  });
  return { data: hasil.data, meta: hasil.meta };
}
