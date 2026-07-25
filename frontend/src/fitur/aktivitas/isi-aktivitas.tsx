"use client";

import { useCallback, useEffect, useState } from "react";

import { KeadaanError, KeadaanKosong, SkeletonBaris } from "@/komponen/keadaan";
import { KELAS_INPUT_TEKS } from "@/komponen/kolom-form";
import { Paginasi } from "@/komponen/paginasi";
import { KELAS_BADGE_AKSI, OPSI_AKSI_AKTIVITAS, OPSI_ENTITAS_AKTIVITAS } from "@/konstanta/aktivitas";
import { daftarAktivitas } from "@/layanan-api/aktivitas";
import type { Aktivitas } from "@/tipe/aktivitas";
import type { MetaPagination } from "@/tipe/respons-api";
import { formatWaktu } from "@/utilitas/tanggal";

const LIMIT = 15;
type Status = "memuat" | "berhasil" | "gagal";

// Halaman Aktivitas Sistem (admin saja - konsisten dengan backend yang membatasi
// GET /api/aktivitas ke authorizeRoles("admin")). Menampilkan user pelaku, aksi, entitas,
// detail, dan waktu, dengan filter aksi/entitas dan pagination.
export function IsiAktivitas() {
  const [aksi, setAksi] = useState("");
  const [entitas, setEntitas] = useState("");
  const [halaman, setHalaman] = useState(1);

  const [status, setStatus] = useState<Status>("memuat");
  const [data, setData] = useState<Aktivitas[]>([]);
  const [meta, setMeta] = useState<MetaPagination | null>(null);
  const [pesanError, setPesanError] = useState("");

  // Reset halaman ke 1 dilakukan langsung di handler filter (bukan lewat useEffect) agar
  // tidak memicu render berantai.
  function ubahAksi(nilai: string) {
    setAksi(nilai);
    setHalaman(1);
  }

  function ubahEntitas(nilai: string) {
    setEntitas(nilai);
    setHalaman(1);
  }

  const muat = useCallback(async () => {
    setStatus("memuat");
    try {
      const { data: baris, meta: metaBaru } = await daftarAktivitas({
        page: halaman,
        limit: LIMIT,
        aksi: aksi || undefined,
        entitas: entitas || undefined,
      });
      setData(baris);
      setMeta(metaBaru ?? null);
      setStatus("berhasil");
    } catch (error) {
      setPesanError(error instanceof Error ? error.message : "Gagal memuat aktivitas.");
      setStatus("gagal");
    }
  }, [halaman, aksi, entitas]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void muat();
  }, [muat]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">Aktivitas Sistem</h1>
        <p className="mt-0.5 text-sm text-inactive">
          Riwayat login dan perubahan data penting di seluruh sistem.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-surface shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center">
          <select
            value={aksi}
            onChange={(e) => ubahAksi(e.target.value)}
            aria-label="Filter aksi"
            className={`${KELAS_INPUT_TEKS} sm:w-48`}
          >
            <option value="">Semua Aksi</option>
            {OPSI_AKSI_AKTIVITAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <select
            value={entitas}
            onChange={(e) => ubahEntitas(e.target.value)}
            aria-label="Filter entitas"
            className={`${KELAS_INPUT_TEKS} sm:w-48`}
          >
            <option value="">Semua Entitas</option>
            {OPSI_ENTITAS_AKTIVITAS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>

        {status === "memuat" && <SkeletonBaris jumlah={8} />}

        {status === "gagal" && (
          <div className="p-4">
            <KeadaanError pesan={pesanError} onCobaLagi={muat} />
          </div>
        )}

        {status === "berhasil" && data.length === 0 && (
          <KeadaanKosong pesan="Belum ada aktivitas yang tercatat." />
        )}

        {status === "berhasil" && data.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-inactive">
                    <th className="px-4 py-3 font-semibold">Pengguna</th>
                    <th className="px-4 py-3 font-semibold">Aksi</th>
                    <th className="px-4 py-3 font-semibold">Entitas</th>
                    <th className="px-4 py-3 font-semibold">Detail</th>
                    <th className="px-4 py-3 font-semibold">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((a) => (
                    <tr key={a.id} className="transition-colors hover:bg-slate-50">
                      <td className="px-4 py-3">
                        {a.nama_pengguna ? (
                          <div>
                            <p className="font-medium text-foreground">{a.nama_pengguna}</p>
                            <p className="text-xs text-inactive">{a.email_pengguna}</p>
                          </div>
                        ) : (
                          <span className="italic text-slate-300">Akun telah dihapus</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${KELAS_BADGE_AKSI[a.aksi] ?? "bg-slate-100 text-slate-600"}`}
                        >
                          {a.aksi}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-inactive">{a.entitas}</td>
                      <td className="max-w-xs truncate px-4 py-3 text-inactive">{a.detail ?? "-"}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-inactive">
                        {formatWaktu(a.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {meta && <Paginasi meta={meta} onPindahHalaman={setHalaman} />}
          </>
        )}
      </div>
    </div>
  );
}
