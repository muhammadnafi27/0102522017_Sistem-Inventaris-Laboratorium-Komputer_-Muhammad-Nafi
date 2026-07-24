"use client";

import { useRouter } from "next/navigation";

import { WARNA_BAR_KONDISI } from "@/konstanta/kondisi";
import type { KondisiBarang } from "@/tipe/barang";

interface PropsDistribusiKondisi {
  data: { kondisi: KondisiBarang; total: number }[];
}

// Grafik batang horizontal "Kondisi Barang". Setiap baris dapat diklik untuk membuka
// inventaris terfilter kondisi tersebut.
export function DistribusiKondisi({ data }: PropsDistribusiKondisi) {
  const router = useRouter();
  const totalKeseluruhan = data.reduce((jml, d) => jml + d.total, 0);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-surface p-5 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-foreground">Kondisi Barang</h2>
      <div className="flex flex-col gap-4">
        {data.map((d) => {
          const persen = totalKeseluruhan === 0 ? 0 : Math.round((d.total / totalKeseluruhan) * 100);
          return (
            <button
              key={d.kondisi}
              type="button"
              onClick={() =>
                router.push(`/inventaris-barang?kondisi=${encodeURIComponent(d.kondisi)}`)
              }
              className="group text-left"
            >
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="text-foreground transition-colors group-hover:text-primary">
                  {d.kondisi}
                </span>
                <span className="font-semibold text-foreground tabular-nums">{d.total}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${WARNA_BAR_KONDISI[d.kondisi]} transition-all duration-500`}
                  style={{ width: `${persen}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
