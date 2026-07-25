"use client";

import { useState, type FormEvent } from "react";

import { KELAS_INPUT_TEKS, KolomForm } from "@/komponen/kolom-form";
import { Modal } from "@/komponen/modal";
import { buatKategori, perbaruiKategori, type NilaiFormKategori } from "@/layanan-api/kategori";
import { KesalahanApi } from "@/layanan-api/klien";
import type { Kategori } from "@/tipe/kategori";

interface PropsModalFormKategori {
  terbuka: boolean;
  // Kategori yang diedit; null berarti mode tambah.
  kategori: Kategori | null;
  onTutup: () => void;
  onBerhasil: (pesan: string) => void;
}

function validasiClient(nilai: NilaiFormKategori): Record<string, string> {
  const err: Record<string, string> = {};
  if (nilai.nama_kategori.trim().length < 2) err.nama_kategori = "Nama kategori minimal 2 karakter.";
  if (nilai.deskripsi.length > 255) err.deskripsi = "Deskripsi maksimal 255 karakter.";
  return err;
}

// Modal form tambah/edit kategori. Komponen ini di-remount (lewat prop key dari induk) setiap
// kali dibuka, sehingga inisialisasi state via useState cukup tanpa efek reset tambahan.
export function ModalFormKategori({
  terbuka,
  kategori,
  onTutup,
  onBerhasil,
}: PropsModalFormKategori) {
  const modeEdit = kategori !== null;

  const [nilai, setNilai] = useState<NilaiFormKategori>(() => ({
    nama_kategori: kategori?.nama_kategori ?? "",
    deskripsi: kategori?.deskripsi ?? "",
  }));
  const [errorField, setErrorField] = useState<Record<string, string>>({});
  const [pesanUmum, setPesanUmum] = useState("");
  const [sedangKirim, setSedangKirim] = useState(false);

  async function tanganiSubmit(event: FormEvent) {
    event.preventDefault();
    setPesanUmum("");

    const err = validasiClient(nilai);
    setErrorField(err);
    if (Object.keys(err).length > 0) return;

    setSedangKirim(true);
    try {
      if (modeEdit && kategori) {
        await perbaruiKategori(kategori.id, nilai);
        onBerhasil("Kategori berhasil diperbarui.");
      } else {
        await buatKategori(nilai);
        onBerhasil("Kategori berhasil ditambahkan.");
      }
    } catch (error) {
      if (error instanceof KesalahanApi) {
        if (error.kesalahan?.length) {
          const peta: Record<string, string> = {};
          for (const k of error.kesalahan) peta[k.field] = k.pesan;
          setErrorField(peta);
        }
        setPesanUmum(error.message);
      } else {
        setPesanUmum("Terjadi kesalahan yang tidak terduga.");
      }
    } finally {
      setSedangKirim(false);
    }
  }

  return (
    <Modal
      terbuka={terbuka}
      judul={modeEdit ? "Edit Kategori" : "Tambah Kategori"}
      onTutup={onTutup}
      lebar="md"
    >
      <form onSubmit={tanganiSubmit} noValidate className="flex flex-col gap-4">
        {pesanUmum && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-delete">
            {pesanUmum}
          </p>
        )}

        <KolomForm id="nama_kategori" label="Nama Kategori" kesalahan={errorField.nama_kategori}>
          <input
            id="nama_kategori"
            value={nilai.nama_kategori}
            onChange={(e) => setNilai((s) => ({ ...s, nama_kategori: e.target.value }))}
            className={KELAS_INPUT_TEKS}
            placeholder="Contoh: Komputer"
          />
        </KolomForm>

        <KolomForm id="deskripsi" label="Deskripsi (opsional)" kesalahan={errorField.deskripsi}>
          <textarea
            id="deskripsi"
            value={nilai.deskripsi}
            onChange={(e) => setNilai((s) => ({ ...s, deskripsi: e.target.value }))}
            rows={3}
            className={KELAS_INPUT_TEKS}
            placeholder="Keterangan singkat kategori ini"
          />
        </KolomForm>

        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onTutup}
            disabled={sedangKirim}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={sedangKirim}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-update disabled:opacity-60"
          >
            {sedangKirim ? "Menyimpan..." : "Simpan Kategori"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
