"use client";

import { BadgeKondisi } from "@/komponen/badge-kondisi";
import { FotoBarang } from "@/komponen/foto-barang";
import { IkonEdit, IkonHapus, IkonMata } from "@/komponen/ikon";
import type { Barang } from "@/tipe/barang";

interface PropsDaftarBarang {
  data: Barang[];
  bolehEdit: boolean;
  bolehHapus: boolean;
  onDetail: (barang: Barang) => void;
  onEdit: (barang: Barang) => void;
  onHapus: (barang: Barang) => void;
}

// Tombol aksi baris (detail selalu ada; edit/hapus mengikuti role). Aksi yang dilarang role
// tidak dirender sama sekali - konsisten dengan penegakan role di backend.
function TombolAksi({
  barang,
  bolehEdit,
  bolehHapus,
  onDetail,
  onEdit,
  onHapus,
}: {
  barang: Barang;
  bolehEdit: boolean;
  bolehHapus: boolean;
  onDetail: (b: Barang) => void;
  onEdit: (b: Barang) => void;
  onHapus: (b: Barang) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onDetail(barang)}
        aria-label={`Detail ${barang.nama_barang}`}
        className="rounded-md p-1.5 text-inactive transition-colors hover:bg-slate-100 hover:text-primary"
      >
        <IkonMata className="h-5 w-5" />
      </button>
      {bolehEdit && (
        <button
          type="button"
          onClick={() => onEdit(barang)}
          aria-label={`Edit ${barang.nama_barang}`}
          className="rounded-md p-1.5 text-inactive transition-colors hover:bg-blue-50 hover:text-update"
        >
          <IkonEdit className="h-5 w-5" />
        </button>
      )}
      {bolehHapus && (
        <button
          type="button"
          onClick={() => onHapus(barang)}
          aria-label={`Hapus ${barang.nama_barang}`}
          className="rounded-md p-1.5 text-inactive transition-colors hover:bg-red-50 hover:text-delete"
        >
          <IkonHapus className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

// Menampilkan barang sebagai tabel di desktop dan daftar kartu di layar kecil (PRD 5).
export function DaftarBarang({
  data,
  bolehEdit,
  bolehHapus,
  onDetail,
  onEdit,
  onHapus,
}: PropsDaftarBarang) {
  return (
    <>
      {/* Tabel desktop (md ke atas). overflow-x-auto menjaga tabel tetap terbaca bila menyempit. */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-inactive">
              <th className="px-4 py-3 font-semibold">Foto</th>
              <th className="px-4 py-3 font-semibold">Kode</th>
              <th className="px-4 py-3 font-semibold">Nama Barang</th>
              <th className="px-4 py-3 font-semibold">Kategori</th>
              <th className="px-4 py-3 font-semibold">Kondisi</th>
              <th className="px-4 py-3 font-semibold">Lokasi</th>
              <th className="px-4 py-3 text-right font-semibold">Jumlah</th>
              <th className="px-4 py-3 text-right font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((barang) => (
              <tr key={barang.id} className="transition-colors hover:bg-slate-50">
                <td className="px-4 py-2.5">
                  <FotoBarang namaFile={barang.foto} namaBarang={barang.nama_barang} ukuran="sm" />
                </td>
                <td className="px-4 py-2.5 font-semibold text-foreground">{barang.kode_barang}</td>
                <td className="px-4 py-2.5 text-foreground">{barang.nama_barang}</td>
                <td className="px-4 py-2.5 text-inactive">{barang.nama_kategori}</td>
                <td className="px-4 py-2.5">
                  <BadgeKondisi kondisi={barang.kondisi} />
                </td>
                <td className="px-4 py-2.5 text-inactive">{barang.lokasi}</td>
                <td className="px-4 py-2.5 text-right font-medium text-foreground">{barang.jumlah}</td>
                <td className="px-4 py-2.5">
                  <div className="flex justify-end">
                    <TombolAksi
                      barang={barang}
                      bolehEdit={bolehEdit}
                      bolehHapus={bolehHapus}
                      onDetail={onDetail}
                      onEdit={onEdit}
                      onHapus={onHapus}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Daftar kartu mobile (di bawah md). */}
      <ul className="flex flex-col divide-y divide-slate-100 md:hidden">
        {data.map((barang) => (
          <li key={barang.id} className="flex items-center gap-3 p-4">
            <FotoBarang namaFile={barang.foto} namaBarang={barang.nama_barang} ukuran="md" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-semibold text-foreground">{barang.kode_barang}</p>
                <BadgeKondisi kondisi={barang.kondisi} />
              </div>
              <p className="truncate text-sm text-foreground">{barang.nama_barang}</p>
              <p className="mt-0.5 text-xs text-inactive">
                {barang.nama_kategori} · {barang.lokasi} · Jumlah {barang.jumlah}
              </p>
            </div>
            <TombolAksi
              barang={barang}
              bolehEdit={bolehEdit}
              bolehHapus={bolehHapus}
              onDetail={onDetail}
              onEdit={onEdit}
              onHapus={onHapus}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
