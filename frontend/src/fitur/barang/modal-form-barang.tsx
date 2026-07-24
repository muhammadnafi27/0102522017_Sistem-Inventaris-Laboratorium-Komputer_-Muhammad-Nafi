"use client";

import { useState, type FormEvent } from "react";

import { AreaUploadFoto } from "@/fitur/barang/area-upload-foto";
import { KELAS_INPUT_TEKS, KolomForm } from "@/komponen/kolom-form";
import { Modal } from "@/komponen/modal";
import { OPSI_KONDISI } from "@/konstanta/kondisi";
import { buatBarang, perbaruiBarang } from "@/layanan-api/barang";
import { KesalahanApi } from "@/layanan-api/klien";
import type { Barang, KondisiBarang, NilaiFormBarang } from "@/tipe/barang";
import type { Kategori } from "@/tipe/kategori";

interface PropsModalFormBarang {
  terbuka: boolean;
  // Barang yang diedit; null berarti mode tambah.
  barang: Barang | null;
  kategori: Kategori[];
  onTutup: () => void;
  onBerhasil: (pesan: string) => void;
}

function nilaiAwal(barang: Barang | null): NilaiFormBarang {
  return {
    kode_barang: barang?.kode_barang ?? "",
    nama_barang: barang?.nama_barang ?? "",
    kategori_id: barang ? String(barang.kategori_id) : "",
    kondisi: barang?.kondisi ?? "Baik",
    lokasi: barang?.lokasi ?? "",
    jumlah: barang ? String(barang.jumlah) : "0",
    foto: null,
  };
}

// Validasi client ringan yang mencerminkan aturan bisnis backend (PRD 3.1). Backend tetap
// menjadi otoritas akhir; error per-field dari backend juga ditampilkan di bawah input.
function validasiClient(nilai: NilaiFormBarang): Record<string, string> {
  const err: Record<string, string> = {};
  if (nilai.kode_barang.trim().length < 2) err.kode_barang = "Kode barang minimal 2 karakter.";
  else if (!/^[A-Za-z0-9-]+$/.test(nilai.kode_barang.trim()))
    err.kode_barang = "Hanya huruf, angka, dan tanda hubung.";
  if (nilai.nama_barang.trim().length < 3) err.nama_barang = "Nama barang minimal 3 karakter.";
  if (!nilai.kategori_id) err.kategori_id = "Kategori wajib dipilih.";
  if (nilai.lokasi.trim().length < 2) err.lokasi = "Lokasi wajib diisi.";
  const jumlah = Number(nilai.jumlah);
  if (!Number.isInteger(jumlah) || jumlah < 0) err.jumlah = "Jumlah harus bilangan bulat ≥ 0.";
  return err;
}

// Modal form dua kolom untuk tambah/edit barang, dengan area upload foto drag-and-drop.
export function ModalFormBarang({
  terbuka,
  barang,
  kategori,
  onTutup,
  onBerhasil,
}: PropsModalFormBarang) {
  const modeEdit = barang !== null;

  // Nilai awal cukup diambil sekali via inisialisasi useState karena komponen ini di-remount
  // (lewat prop key dari induk) setiap kali modal dibuka - sehingga form selalu dalam kondisi
  // bersih tanpa perlu efek reset yang memicu setState.
  const [nilai, setNilai] = useState<NilaiFormBarang>(() => nilaiAwal(barang));
  const [errorField, setErrorField] = useState<Record<string, string>>({});
  const [pesanUmum, setPesanUmum] = useState("");
  const [sedangKirim, setSedangKirim] = useState(false);

  function atur<K extends keyof NilaiFormBarang>(field: K, v: NilaiFormBarang[K]) {
    setNilai((s) => ({ ...s, [field]: v }));
  }

  async function tanganiSubmit(event: FormEvent) {
    event.preventDefault();
    setPesanUmum("");

    const err = validasiClient(nilai);
    setErrorField(err);
    if (Object.keys(err).length > 0) return;

    setSedangKirim(true);
    try {
      if (modeEdit && barang) {
        await perbaruiBarang(barang.id, nilai);
        onBerhasil("Barang berhasil diperbarui.");
      } else {
        await buatBarang(nilai);
        onBerhasil("Barang berhasil ditambahkan.");
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
    <Modal terbuka={terbuka} judul={modeEdit ? "Edit Barang" : "Tambah Barang"} onTutup={onTutup} lebar="lg">
      <form onSubmit={tanganiSubmit} noValidate className="flex flex-col gap-4">
        {pesanUmum && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-delete">
            {pesanUmum}
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <KolomForm id="kode_barang" label="Kode Barang" kesalahan={errorField.kode_barang}>
            <input
              id="kode_barang"
              value={nilai.kode_barang}
              onChange={(e) => atur("kode_barang", e.target.value)}
              className={KELAS_INPUT_TEKS}
              placeholder="Contoh: PC-011"
            />
          </KolomForm>

          <KolomForm id="nama_barang" label="Nama Barang" kesalahan={errorField.nama_barang}>
            <input
              id="nama_barang"
              value={nilai.nama_barang}
              onChange={(e) => atur("nama_barang", e.target.value)}
              className={KELAS_INPUT_TEKS}
              placeholder="Contoh: PC Desktop Core i5"
            />
          </KolomForm>

          <KolomForm id="kategori_id" label="Kategori" kesalahan={errorField.kategori_id}>
            <select
              id="kategori_id"
              value={nilai.kategori_id}
              onChange={(e) => atur("kategori_id", e.target.value)}
              className={KELAS_INPUT_TEKS}
            >
              <option value="">Pilih kategori</option>
              {kategori.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.nama_kategori}
                </option>
              ))}
            </select>
          </KolomForm>

          <KolomForm id="kondisi" label="Kondisi" kesalahan={errorField.kondisi}>
            <select
              id="kondisi"
              value={nilai.kondisi}
              onChange={(e) => atur("kondisi", e.target.value as KondisiBarang)}
              className={KELAS_INPUT_TEKS}
            >
              {OPSI_KONDISI.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </KolomForm>

          <KolomForm id="lokasi" label="Lokasi" kesalahan={errorField.lokasi}>
            <input
              id="lokasi"
              value={nilai.lokasi}
              onChange={(e) => atur("lokasi", e.target.value)}
              className={KELAS_INPUT_TEKS}
              placeholder="Contoh: Lab Komputer 1"
            />
          </KolomForm>

          <KolomForm id="jumlah" label="Jumlah" kesalahan={errorField.jumlah}>
            <input
              id="jumlah"
              type="number"
              min={0}
              value={nilai.jumlah}
              onChange={(e) => atur("jumlah", e.target.value)}
              className={KELAS_INPUT_TEKS}
            />
          </KolomForm>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-foreground">Foto Barang</span>
          <AreaUploadFoto
            file={nilai.foto}
            onPilihFile={(f) => atur("foto", f)}
            fotoLama={barang?.foto}
          />
        </div>

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
            {sedangKirim ? "Menyimpan..." : "Simpan Barang"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
