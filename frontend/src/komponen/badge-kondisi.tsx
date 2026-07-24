import { KELAS_BADGE_KONDISI } from "@/konstanta/kondisi";
import type { KondisiBarang } from "@/tipe/barang";

// Badge kondisi barang dengan warna sesuai PRD 4.1 (hijau/kuning/merah/abu-abu).
export function BadgeKondisi({ kondisi }: { kondisi: KondisiBarang }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${KELAS_BADGE_KONDISI[kondisi]}`}
    >
      {kondisi}
    </span>
  );
}
