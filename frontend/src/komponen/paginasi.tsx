"use client";

import { IkonChevronKiri, IkonChevronKanan } from "@/komponen/ikon";
import type { MetaPagination } from "@/tipe/respons-api";

interface PropsPaginasi {
  meta: MetaPagination;
  onPindahHalaman: (halaman: number) => void;
}

// Kontrol pagination: menampilkan rentang data yang sedang tampil, total, serta tombol
// sebelumnya/berikutnya. Tombol dinonaktifkan di batas awal/akhir.
export function Paginasi({ meta, onPindahHalaman }: PropsPaginasi) {
  const { halaman, batas, totalData, totalHalaman } = meta;

  const dari = totalData === 0 ? 0 : (halaman - 1) * batas + 1;
  const sampai = Math.min(halaman * batas, totalData);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row">
      <p className="text-sm text-inactive">
        Menampilkan <span className="font-medium text-foreground">{dari}</span>–
        <span className="font-medium text-foreground">{sampai}</span> dari{" "}
        <span className="font-medium text-foreground">{totalData}</span> data
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPindahHalaman(halaman - 1)}
          disabled={halaman <= 1}
          className="flex items-center gap-1 whitespace-nowrap rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <IkonChevronKiri className="h-4 w-4" />
          Sebelumnya
        </button>
        {/* whitespace-nowrap mencegah teks "Hal. 1 / 1" terpotong menjadi dua baris
            dan merusak tinggi baris kontrol pagination di layar 390px. */}
        <span className="px-3 text-sm whitespace-nowrap text-inactive">
          Hal. <span className="font-semibold text-foreground">{halaman}</span> / {totalHalaman}
        </span>
        <button
          type="button"
          onClick={() => onPindahHalaman(halaman + 1)}
          disabled={halaman >= totalHalaman}
          className="flex items-center gap-1 whitespace-nowrap rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Berikutnya
          <IkonChevronKanan className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
