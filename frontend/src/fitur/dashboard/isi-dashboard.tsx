"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { BadgeRole } from "@/komponen/badge-role";
import { IkonTambah } from "@/komponen/ikon";
import { KeadaanError, SkeletonKartu } from "@/komponen/keadaan";
import { RoleGuard } from "@/komponen/role-guard";
import { DaftarBarangRingkas } from "@/fitur/dashboard/daftar-barang-ringkas";
import { DistribusiKategori } from "@/fitur/dashboard/distribusi-kategori";
import { DistribusiKondisi } from "@/fitur/dashboard/distribusi-kondisi";
import { KartuStatistik } from "@/fitur/dashboard/kartu-statistik";
import { useAuth } from "@/konteks/auth-konteks";
import { ambilRingkasanDashboard } from "@/layanan-api/dashboard";
import type { RingkasanDashboard } from "@/tipe/dashboard";
import { formatTanggal, salamWaktu } from "@/utilitas/tanggal";

type Status = "memuat" | "berhasil" | "gagal";

// Komponen klien yang memuat dan menampilkan seluruh isi dashboard. Dipisah dari page.tsx
// (server component) agar page tetap ringan dan metadata tetap statis.
export function IsiDashboard() {
  const { pengguna } = useAuth();
  const router = useRouter();

  const [status, setStatus] = useState<Status>("memuat");
  const [data, setData] = useState<RingkasanDashboard | null>(null);
  const [pesanError, setPesanError] = useState("");

  const muat = useCallback(async () => {
    setStatus("memuat");
    try {
      const hasil = await ambilRingkasanDashboard();
      setData(hasil);
      setStatus("berhasil");
    } catch (error) {
      setPesanError(error instanceof Error ? error.message : "Gagal memuat dashboard.");
      setStatus("gagal");
    }
  }, []);

  useEffect(() => {
    // Sinkronisasi data ringkasan dari server saat dashboard dimuat; setState hasil fetch
    // bersifat asinkron dan aman - aturan set-state-in-effect over-flag pola data-fetching ini.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void muat();
  }, [muat]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header sapaan + tombol Tambah Barang (khusus admin/operator). */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">
              {salamWaktu()}, {pengguna?.nama ?? "Pengguna"}
            </h1>
            {pengguna && <BadgeRole role={pengguna.role} />}
          </div>
          <p className="mt-0.5 text-sm text-inactive">{formatTanggal(new Date().toISOString())}</p>
        </div>

        <RoleGuard roles={["admin", "operator"]}>
          <button
            type="button"
            onClick={() => router.push("/inventaris-barang?aksi=tambah")}
            className="inline-flex items-center gap-2 self-start rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-update sm:self-auto"
          >
            <IkonTambah className="h-4 w-4" />
            Tambah Barang
          </button>
        </RoleGuard>
      </div>

      {status === "memuat" && (
        <>
          <SkeletonKartu />
          <div className="h-64 animate-pulse rounded-xl bg-slate-200" />
        </>
      )}

      {status === "gagal" && <KeadaanError pesan={pesanError} onCobaLagi={muat} />}

      {status === "berhasil" && data && (
        <>
          <KartuStatistik
            totalBarang={data.totalBarang}
            totalKategori={data.totalKategori}
            kondisiBaik={data.kondisiBaik}
            perluPerhatian={data.perluPerhatian}
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <DistribusiKondisi data={data.distribusiKondisi} />
            <DistribusiKategori data={data.distribusiKategori} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <DaftarBarangRingkas
              judul="Barang Terbaru"
              data={data.barangTerbaru}
              pesanKosong="Belum ada barang."
            />
            <DaftarBarangRingkas
              judul="Perlu Perhatian"
              data={data.daftarPerluPerhatian}
              pesanKosong="Tidak ada barang yang perlu perhatian. "
            />
          </div>
        </>
      )}
    </div>
  );
}
