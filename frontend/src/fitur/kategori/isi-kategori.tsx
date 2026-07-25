"use client";

import { useCallback, useEffect, useState } from "react";

import { DialogKonfirmasi } from "@/komponen/dialog-konfirmasi";
import { IkonEdit, IkonHapus, IkonKategori, IkonTambah } from "@/komponen/ikon";
import { KeadaanError, KeadaanKosong, SkeletonBaris } from "@/komponen/keadaan";
import { ModalFormKategori } from "@/fitur/kategori/modal-form-kategori";
import { useAuth } from "@/konteks/auth-konteks";
import { useToast } from "@/konteks/toast-konteks";
import { daftarKategori, hapusKategori } from "@/layanan-api/kategori";
import { KesalahanApi } from "@/layanan-api/klien";
import type { Kategori } from "@/tipe/kategori";
import { bolehAkses } from "@/utilitas/izin";
import { formatTanggal } from "@/utilitas/tanggal";

type Status = "memuat" | "berhasil" | "gagal";

// Halaman Kategori Barang: daftar kategori (nama, deskripsi, jumlah barang, waktu update),
// tambah/edit untuk admin & operator, hapus khusus admin. Pesan 409 (kategori masih dipakai
// barang) ditampilkan apa adanya dari backend lewat toast agar penyebabnya jelas bagi pengguna.
export function IsiKategori() {
  const { pengguna } = useAuth();
  const toast = useToast();

  const bolehTambahEdit = bolehAkses(pengguna, ["admin", "operator"]);
  const bolehHapus = bolehAkses(pengguna, ["admin"]);

  const [status, setStatus] = useState<Status>("memuat");
  const [data, setData] = useState<Kategori[]>([]);
  const [pesanError, setPesanError] = useState("");

  const [modalForm, setModalForm] = useState<{ terbuka: boolean; kategori: Kategori | null }>({
    terbuka: false,
    kategori: null,
  });
  const [formKey, setFormKey] = useState(0);
  const [kategoriHapus, setKategoriHapus] = useState<Kategori | null>(null);
  const [sedangHapus, setSedangHapus] = useState(false);

  const bukaForm = useCallback((k: Kategori | null) => {
    setModalForm({ terbuka: true, kategori: k });
    setFormKey((n) => n + 1);
  }, []);

  const muat = useCallback(async () => {
    setStatus("memuat");
    try {
      setData(await daftarKategori());
      setStatus("berhasil");
    } catch (error) {
      setPesanError(error instanceof Error ? error.message : "Gagal memuat kategori.");
      setStatus("gagal");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void muat();
  }, [muat]);

  async function setelahMutasiForm(pesan: string) {
    setModalForm({ terbuka: false, kategori: null });
    toast.tampilkanSukses(pesan);
    await muat();
  }

  async function konfirmasiHapus() {
    if (!kategoriHapus) return;
    setSedangHapus(true);
    try {
      await hapusKategori(kategoriHapus.id);
      toast.tampilkanSukses("Kategori berhasil dihapus.");
      setKategoriHapus(null);
      await muat();
    } catch (error) {
      // Pesan 409 dari backend ("Kategori ... masih dipakai oleh N barang...") ditampilkan
      // apa adanya lewat toast, sesuai permintaan agar konflik terlihat jelas.
      const pesan = error instanceof KesalahanApi ? error.message : "Gagal menghapus kategori.";
      toast.tampilkanGagal(pesan);
      setKategoriHapus(null);
    } finally {
      setSedangHapus(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">Kategori Barang</h1>
          <p className="mt-0.5 text-sm text-inactive">
            Kelola kategori inventaris beserta jumlah barang di dalamnya.
          </p>
        </div>
        {bolehTambahEdit && (
          <button
            type="button"
            onClick={() => bukaForm(null)}
            className="inline-flex items-center gap-2 self-start rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-update sm:self-auto"
          >
            <IkonTambah className="h-4 w-4" />
            Tambah Kategori
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-surface shadow-sm">
        {status === "memuat" && <SkeletonBaris jumlah={6} />}

        {status === "gagal" && (
          <div className="p-4">
            <KeadaanError pesan={pesanError} onCobaLagi={muat} />
          </div>
        )}

        {status === "berhasil" && data.length === 0 && (
          <KeadaanKosong pesan="Belum ada kategori. Tambahkan kategori pertama Anda." />
        )}

        {status === "berhasil" && data.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-inactive">
                  <th className="px-4 py-3 font-semibold">Kategori</th>
                  <th className="px-4 py-3 font-semibold">Deskripsi</th>
                  <th className="px-4 py-3 text-right font-semibold">Jumlah Barang</th>
                  <th className="px-4 py-3 font-semibold">Terakhir Diperbarui</th>
                  <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((k) => (
                  <tr key={k.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <IkonKategori className="h-4 w-4" />
                        </span>
                        <span className="font-semibold text-foreground">{k.nama_kategori}</span>
                      </div>
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-inactive">
                      {k.deskripsi || <span className="italic text-slate-300">Tanpa deskripsi</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums text-foreground">
                      {k.jumlah_barang}
                    </td>
                    <td className="px-4 py-3 text-inactive">{formatTanggal(k.updated_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {bolehTambahEdit && (
                          <button
                            type="button"
                            onClick={() => bukaForm(k)}
                            aria-label={`Edit ${k.nama_kategori}`}
                            className="rounded-md p-1.5 text-inactive transition-colors hover:bg-blue-50 hover:text-update"
                          >
                            <IkonEdit className="h-5 w-5" />
                          </button>
                        )}
                        {bolehHapus && (
                          <button
                            type="button"
                            onClick={() => setKategoriHapus(k)}
                            aria-label={`Hapus ${k.nama_kategori}`}
                            className="rounded-md p-1.5 text-inactive transition-colors hover:bg-red-50 hover:text-delete"
                          >
                            <IkonHapus className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ModalFormKategori
        key={formKey}
        terbuka={modalForm.terbuka}
        kategori={modalForm.kategori}
        onTutup={() => setModalForm({ terbuka: false, kategori: null })}
        onBerhasil={setelahMutasiForm}
      />

      <DialogKonfirmasi
        terbuka={kategoriHapus !== null}
        judul="Hapus Kategori"
        pesan={`Yakin ingin menghapus kategori "${kategoriHapus?.nama_kategori ?? ""}"? Tindakan ini tidak dapat dibatalkan.`}
        sedangProses={sedangHapus}
        onKonfirmasi={konfirmasiHapus}
        onBatal={() => setKategoriHapus(null)}
      />
    </div>
  );
}
