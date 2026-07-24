"use client";

import { IkonCari, IkonReset } from "@/komponen/ikon";
import { KELAS_INPUT_TEKS } from "@/komponen/kolom-form";
import { OPSI_KONDISI } from "@/konstanta/kondisi";
import type { KondisiBarang } from "@/tipe/barang";
import type { Kategori } from "@/tipe/kategori";

export interface NilaiFilter {
  search: string;
  kategori_id: string;
  kondisi: string;
  lokasi: string;
}

interface PropsFilterBarang {
  nilai: NilaiFilter;
  kategori: Kategori[];
  daftarLokasi: string[];
  onUbah: (patch: Partial<NilaiFilter>) => void;
  onReset: () => void;
}

// Baris filter inventaris: search (dengan ikon), dropdown kategori/kondisi/lokasi, dan tombol
// reset. Nilai dikendalikan oleh halaman induk yang menyinkronkannya ke URL search params.
export function FilterBarang({ nilai, kategori, daftarLokasi, onUbah, onReset }: PropsFilterBarang) {
  const adaFilterAktif =
    nilai.search !== "" || nilai.kategori_id !== "" || nilai.kondisi !== "" || nilai.lokasi !== "";

  return (
    <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <IkonCari className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-inactive" />
        <input
          value={nilai.search}
          onChange={(e) => onUbah({ search: e.target.value })}
          placeholder="Cari kode atau nama barang..."
          aria-label="Cari barang"
          className={`${KELAS_INPUT_TEKS} pl-9`}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:items-center">
        {/* Dropdown kategori hanya ditampilkan bila opsi tersedia (viewer tidak memuat kategori). */}
        {kategori.length > 0 && (
          <select
            value={nilai.kategori_id}
            onChange={(e) => onUbah({ kategori_id: e.target.value })}
            aria-label="Filter kategori"
            className={`${KELAS_INPUT_TEKS} lg:w-40`}
          >
            <option value="">Semua Kategori</option>
            {kategori.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama_kategori}
              </option>
            ))}
          </select>
        )}

        <select
          value={nilai.kondisi}
          onChange={(e) => onUbah({ kondisi: e.target.value as KondisiBarang | "" })}
          aria-label="Filter kondisi"
          className={`${KELAS_INPUT_TEKS} lg:w-40`}
        >
          <option value="">Semua Kondisi</option>
          {OPSI_KONDISI.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>

        <select
          value={nilai.lokasi}
          onChange={(e) => onUbah({ lokasi: e.target.value })}
          aria-label="Filter lokasi"
          className={`${KELAS_INPUT_TEKS} lg:w-44`}
        >
          <option value="">Semua Lokasi</option>
          {daftarLokasi.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>

        {adaFilterAktif && (
          <button
            type="button"
            onClick={onReset}
            className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-inactive transition-colors hover:bg-slate-50 hover:text-foreground sm:col-span-1"
          >
            <IkonReset className="h-4 w-4" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
