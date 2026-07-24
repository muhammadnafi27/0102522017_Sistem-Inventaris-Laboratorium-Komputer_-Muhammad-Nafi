"use client";

import { useRouter } from "next/navigation";

import { BadgeKondisi } from "@/komponen/badge-kondisi";
import { FotoBarang } from "@/komponen/foto-barang";
import type { Barang } from "@/tipe/barang";

interface PropsDaftarBarangRingkas {
  judul: string;
  data: Barang[];
  pesanKosong: string;
}

// Daftar barang ringkas untuk panel "Barang Terbaru" dan "Perlu Perhatian" di dashboard.
// Setiap baris dapat diklik untuk menuju detail barang di halaman inventaris.
export function DaftarBarangRingkas({ judul, data, pesanKosong }: PropsDaftarBarangRingkas) {
  const router = useRouter();

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-surface p-5 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-foreground">{judul}</h2>

      {data.length === 0 ? (
        <p className="py-6 text-center text-sm text-inactive">{pesanKosong}</p>
      ) : (
        <ul className="flex flex-col gap-0.5">
          {data.map((barang) => (
            <li key={barang.id}>
              <button
                type="button"
                onClick={() => router.push(`/inventaris-barang?detail=${barang.id}`)}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-slate-50"
              >
                <FotoBarang namaFile={barang.foto} namaBarang={barang.nama_barang} ukuran="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{barang.nama_barang}</p>
                  <p className="text-xs text-inactive">
                    {barang.kode_barang} · {barang.lokasi}
                  </p>
                </div>
                <BadgeKondisi kondisi={barang.kondisi} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
