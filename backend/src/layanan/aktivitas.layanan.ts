import { aktivitasRepository } from "@/repository/aktivitas.repository";
import type { AktivitasDenganUserRow } from "@/tipe/basis-data";
import type { MetaPagination } from "@/utilitas/respons";

const BATAS_DEFAULT = 10;
const BATAS_MAKSIMUM = 100;

export interface QueryDaftarAktivitas {
  page?: number;
  limit?: number;
  aksi?: string;
  entitas?: string;
}

export const aktivitasLayanan = {
  async daftar(
    query: QueryDaftarAktivitas,
  ): Promise<{ data: AktivitasDenganUserRow[]; meta: MetaPagination }> {
    const halaman = Math.max(1, query.page ?? 1);
    const batas = Math.min(BATAS_MAKSIMUM, Math.max(1, query.limit ?? BATAS_DEFAULT));
    const filter = { aksi: query.aksi?.trim() || undefined, entitas: query.entitas?.trim() || undefined };

    const [data, totalData] = await Promise.all([
      aktivitasRepository.cariDenganFilter({ ...filter, halaman, batas }),
      aktivitasRepository.hitungDenganFilter(filter),
    ]);

    const totalHalaman = totalData === 0 ? 1 : Math.ceil(totalData / batas);

    return { data, meta: { halaman, batas, totalData, totalHalaman } };
  },
};
