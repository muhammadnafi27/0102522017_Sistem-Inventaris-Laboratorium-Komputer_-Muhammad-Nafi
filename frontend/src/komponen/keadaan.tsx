"use client";

import { IkonInventaris } from "@/komponen/ikon";

// Kumpulan komponen tampilan status data yang dipakai berulang: kosong, error, dan skeleton.

export function KeadaanKosong({ pesan, aksi }: { pesan: string; aksi?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <IkonInventaris className="h-7 w-7" />
      </div>
      <p className="max-w-sm text-sm text-inactive">{pesan}</p>
      {aksi}
    </div>
  );
}

export function KeadaanError({ pesan, onCobaLagi }: { pesan: string; onCobaLagi?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 px-6 py-12 text-center">
      <p className="max-w-md text-sm text-delete">{pesan}</p>
      {onCobaLagi && (
        <button
          type="button"
          onClick={onCobaLagi}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-update"
        >
          Coba Lagi
        </button>
      )}
    </div>
  );
}

// Skeleton baris untuk tabel/daftar selagi data dimuat.
export function SkeletonBaris({ jumlah = 5 }: { jumlah?: number }) {
  return (
    <div className="flex flex-col gap-3 p-4">
      {Array.from({ length: jumlah }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-11 w-11 shrink-0 animate-pulse rounded-lg bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonKartu({ jumlah = 4 }: { jumlah?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: jumlah }).map((_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-200" />
      ))}
    </div>
  );
}
