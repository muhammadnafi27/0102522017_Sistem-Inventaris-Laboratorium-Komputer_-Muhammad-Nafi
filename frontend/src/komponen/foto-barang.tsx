"use client";

import { useState } from "react";

import { IkonGambar } from "@/komponen/ikon";
import { urlFotoBarang } from "@/utilitas/foto";

interface PropsFotoBarang {
  namaFile: string | null;
  namaBarang: string;
  ukuran?: "sm" | "md" | "lg";
}

const KELAS_UKURAN: Record<NonNullable<PropsFotoBarang["ukuran"]>, string> = {
  sm: "h-11 w-11",
  md: "h-14 w-14",
  lg: "h-full w-full",
};

// Menampilkan foto barang dengan fallback: bila nama file kosong atau gambar gagal dimuat,
// tampilkan placeholder ikon agar layout tabel/detail tidak pecah (PRD: fallback foto).
export function FotoBarang({ namaFile, namaBarang, ukuran = "sm" }: PropsFotoBarang) {
  const [gagal, setGagal] = useState(false);
  const url = urlFotoBarang(namaFile);

  const kelasBungkus = `${KELAS_UKURAN[ukuran]} shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50`;

  if (!url || gagal) {
    return (
      <div className={`${kelasBungkus} flex items-center justify-center text-slate-300`}>
        <IkonGambar className="h-1/2 w-1/2" />
      </div>
    );
  }

  return (
    <div className={kelasBungkus}>
      {/* Sengaja memakai <img> biasa (bukan next/image) karena sumbernya host backend eksternal
          dan tidak butuh optimisasi; onError memicu fallback placeholder. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt={`Foto ${namaBarang}`}
        className="h-full w-full object-cover"
        onError={() => setGagal(true)}
      />
    </div>
  );
}
