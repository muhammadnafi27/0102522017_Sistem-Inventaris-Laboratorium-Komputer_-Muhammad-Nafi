"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { DaftarBarang } from "@/fitur/barang/daftar-barang";
import { FilterBarang, type NilaiFilter } from "@/fitur/barang/filter-barang";
import { ModalDetailBarang } from "@/fitur/barang/modal-detail-barang";
import { ModalFormBarang } from "@/fitur/barang/modal-form-barang";
import { DialogKonfirmasi } from "@/komponen/dialog-konfirmasi";
import { IkonTambah } from "@/komponen/ikon";
import { KeadaanError, KeadaanKosong, SkeletonBaris } from "@/komponen/keadaan";
import { Paginasi } from "@/komponen/paginasi";
import { useAuth } from "@/konteks/auth-konteks";
import { useToast } from "@/konteks/toast-konteks";
import { useDebounce } from "@/hook/use-debounce";
import { daftarBarang, daftarLokasi, detailBarang, hapusBarang } from "@/layanan-api/barang";
import { daftarKategori } from "@/layanan-api/kategori";
import { KesalahanApi } from "@/layanan-api/klien";
import type { Barang } from "@/tipe/barang";
import type { Kategori } from "@/tipe/kategori";
import type { MetaPagination } from "@/tipe/respons-api";
import { bolehAkses } from "@/utilitas/izin";

const LIMIT = 10;
type Status = "memuat" | "berhasil" | "gagal";

// Orkestrator halaman inventaris: menyinkronkan filter/pagination ke URL search params,
// memuat data barang, serta mengelola modal tambah/edit/detail dan konfirmasi hapus.
export function IsiInventaris() {
  const { pengguna } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // Sumber kebenaran filter = URL search params (agar bisa di-refresh & di-bagikan).
  const halaman = Number(sp.get("page")) || 1;
  const searchUrl = sp.get("search") ?? "";
  const kategoriId = sp.get("kategori_id") ?? "";
  const kondisi = sp.get("kondisi") ?? "";
  const lokasi = sp.get("lokasi") ?? "";

  // Input search dikelola lokal + debounce agar tidak memanggil API pada tiap ketikan.
  const [searchInput, setSearchInput] = useState(searchUrl);
  const searchDebounced = useDebounce(searchInput, 400);

  const [status, setStatus] = useState<Status>("memuat");
  const [dataBarang, setDataBarang] = useState<Barang[]>([]);
  const [meta, setMeta] = useState<MetaPagination | null>(null);
  const [pesanError, setPesanError] = useState("");

  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [opsiLokasi, setOpsiLokasi] = useState<string[]>([]);

  // State modal. formKey di-increment setiap kali form dibuka agar ModalFormBarang di-remount
  // dan selalu mulai dari kondisi bersih (lihat catatan di modal-form-barang.tsx).
  const [modalForm, setModalForm] = useState<{ terbuka: boolean; barang: Barang | null }>({
    terbuka: false,
    barang: null,
  });
  const [formKey, setFormKey] = useState(0);
  const [barangDetail, setBarangDetail] = useState<Barang | null>(null);
  const [barangHapus, setBarangHapus] = useState<Barang | null>(null);
  const [sedangHapus, setSedangHapus] = useState(false);

  const bukaForm = useCallback((barang: Barang | null) => {
    setModalForm({ terbuka: true, barang });
    setFormKey((k) => k + 1);
  }, []);

  const bolehTambahEdit = bolehAkses(pengguna, ["admin", "operator"]);
  const bolehHapus = bolehAkses(pengguna, ["admin"]);

  // Mengganti sebagian filter di URL. Perubahan filter selalu mengembalikan ke halaman 1
  // dan membersihkan parameter aksi/detail agar tidak memicu modal secara tak sengaja.
  const terapkanPatch = useCallback(
    (patch: Record<string, string | number | undefined>, resetHalaman = true) => {
      const params = new URLSearchParams(sp.toString());
      for (const [k, v] of Object.entries(patch)) {
        if (v === undefined || v === "") params.delete(k);
        else params.set(k, String(v));
      }
      if (resetHalaman) params.delete("page");
      params.delete("aksi");
      params.delete("detail");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [sp, pathname, router],
  );

  // Commit hasil debounce search ke URL bila berbeda dari nilai URL saat ini.
  useEffect(() => {
    if (searchDebounced !== searchUrl) {
      terapkanPatch({ search: searchDebounced });
    }
    // terapkanPatch/searchUrl sengaja tidak dimasukkan ke deps agar tidak memicu ulang saat
    // URL berubah oleh commit ini sendiri; guard perbandingan di atas mencegah loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDebounced]);

  // Memuat opsi lokasi (semua role) dan kategori (hanya admin/operator, karena endpoint
  // /api/kategori memang dibatasi role tersebut di backend). Viewer tidak memanggil kategori
  // sehingga tidak menimbulkan 403; dropdown kategori otomatis disembunyikan saat kosong.
  const muatOpsi = useCallback(async () => {
    try {
      const l = await daftarLokasi();
      setOpsiLokasi(l);
    } catch {
      // Kegagalan memuat opsi tidak memblokir tabel.
    }
    if (bolehTambahEdit) {
      try {
        setKategori(await daftarKategori());
      } catch {
        // Abaikan; dropdown/form kategori sekadar kosong bila gagal.
      }
    }
  }, [bolehTambahEdit]);

  useEffect(() => {
    // Efek sinkronisasi data dari server saat komponen dimuat; setState hasil fetch bersifat
    // asinkron dan aman. Aturan set-state-in-effect over-flag pola data-fetching seperti ini.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void muatOpsi();
  }, [muatOpsi]);

  // Memuat daftar barang sesuai filter aktif. Dibungkus useCallback + dipanggil ulang setelah
  // mutasi agar data dan pagination selalu konsisten.
  const muatBarang = useCallback(async () => {
    setStatus("memuat");
    try {
      const { data, meta: metaBaru } = await daftarBarang({
        page: halaman,
        limit: LIMIT,
        search: searchUrl || undefined,
        kategori_id: kategoriId ? Number(kategoriId) : undefined,
        kondisi: (kondisi || undefined) as Barang["kondisi"] | undefined,
        lokasi: lokasi || undefined,
        sort: "created_at",
        order: "desc",
      });
      setDataBarang(data);
      setMeta(metaBaru ?? null);
      setStatus("berhasil");
    } catch (error) {
      setPesanError(error instanceof Error ? error.message : "Gagal memuat data barang.");
      setStatus("gagal");
    }
  }, [halaman, searchUrl, kategoriId, kondisi, lokasi]);

  useEffect(() => {
    // Memuat ulang daftar barang setiap filter/halaman (dari URL) berubah - sinkronisasi
    // dengan sumber data server; sama seperti di atas, disable diperlukan untuk pola fetch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void muatBarang();
  }, [muatBarang]);

  // Membuka modal tambah bila datang dari tombol "Tambah Barang" dashboard (?aksi=tambah).
  const aksiParam = sp.get("aksi");
  useEffect(() => {
    // Sinkronisasi dengan parameter URL (?aksi=tambah dari tombol dashboard): buka modal sekali.
    if (aksiParam === "tambah" && bolehTambahEdit) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      bukaForm(null);
      terapkanPatch({}, false); // bersihkan ?aksi dari URL
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aksiParam, bolehTambahEdit]);

  // Membuka modal detail bila datang dari klik daftar dashboard (?detail=<id>).
  const detailParam = sp.get("detail");
  const detailDimuat = useRef<string | null>(null);
  useEffect(() => {
    if (detailParam && detailDimuat.current !== detailParam) {
      detailDimuat.current = detailParam;
      detailBarang(Number(detailParam))
        .then(setBarangDetail)
        .catch(() => toast.tampilkanGagal("Barang tidak ditemukan."))
        .finally(() => terapkanPatch({}, false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailParam]);

  function ubahFilter(patch: Partial<NilaiFilter>) {
    if ("search" in patch) setSearchInput(patch.search ?? "");
    else terapkanPatch(patch);
  }

  function resetFilter() {
    setSearchInput("");
    terapkanPatch({ search: undefined, kategori_id: undefined, kondisi: undefined, lokasi: undefined });
  }

  // Dipanggil setelah tambah/edit berhasil: tutup modal, tampilkan toast, refresh data + opsi.
  async function setelahMutasiForm(pesan: string) {
    setModalForm({ terbuka: false, barang: null });
    toast.tampilkanSukses(pesan);
    await Promise.all([muatBarang(), muatOpsi()]);
  }

  async function konfirmasiHapus() {
    if (!barangHapus) return;
    setSedangHapus(true);
    try {
      await hapusBarang(barangHapus.id);
      toast.tampilkanSukses("Barang berhasil dihapus.");
      setBarangHapus(null);
      // Bila menghapus item terakhir di halaman >1, mundur satu halaman; jika tidak, refresh.
      if (dataBarang.length === 1 && halaman > 1) {
        terapkanPatch({ page: halaman - 1 }, false);
      } else {
        await Promise.all([muatBarang(), muatOpsi()]);
      }
    } catch (error) {
      const pesan =
        error instanceof KesalahanApi ? error.message : "Gagal menghapus barang.";
      toast.tampilkanGagal(pesan);
      setBarangHapus(null);
    } finally {
      setSedangHapus(false);
    }
  }

  const nilaiFilter: NilaiFilter = { search: searchInput, kategori_id: kategoriId, kondisi, lokasi };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">Inventaris Barang</h1>
          <p className="mt-0.5 text-sm text-inactive">
            Kelola seluruh perangkat laboratorium komputer di satu tempat.
          </p>
        </div>
        {bolehTambahEdit && (
          <button
            type="button"
            onClick={() => bukaForm(null)}
            className="inline-flex items-center gap-2 self-start rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-update sm:self-auto"
          >
            <IkonTambah className="h-4 w-4" />
            Tambah Barang
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-surface shadow-sm">
        <FilterBarang
          nilai={nilaiFilter}
          kategori={kategori}
          daftarLokasi={opsiLokasi}
          onUbah={ubahFilter}
          onReset={resetFilter}
        />

        {status === "memuat" && <SkeletonBaris jumlah={6} />}

        {status === "gagal" && (
          <div className="p-4">
            <KeadaanError pesan={pesanError} onCobaLagi={muatBarang} />
          </div>
        )}

        {status === "berhasil" && dataBarang.length === 0 && (
          <KeadaanKosong pesan="Tidak ada barang yang cocok dengan pencarian atau filter Anda." />
        )}

        {status === "berhasil" && dataBarang.length > 0 && (
          <>
            <DaftarBarang
              data={dataBarang}
              bolehEdit={bolehTambahEdit}
              bolehHapus={bolehHapus}
              onDetail={setBarangDetail}
              onEdit={(b) => bukaForm(b)}
              onHapus={setBarangHapus}
            />
            {meta && <Paginasi meta={meta} onPindahHalaman={(h) => terapkanPatch({ page: h }, false)} />}
          </>
        )}
      </div>

      <ModalFormBarang
        key={formKey}
        terbuka={modalForm.terbuka}
        barang={modalForm.barang}
        kategori={kategori}
        onTutup={() => setModalForm({ terbuka: false, barang: null })}
        onBerhasil={setelahMutasiForm}
      />

      <ModalDetailBarang barang={barangDetail} onTutup={() => setBarangDetail(null)} />

      <DialogKonfirmasi
        terbuka={barangHapus !== null}
        judul="Hapus Barang"
        pesan={`Yakin ingin menghapus "${barangHapus?.nama_barang ?? ""}"? Tindakan ini tidak dapat dibatalkan.`}
        sedangProses={sedangHapus}
        onKonfirmasi={konfirmasiHapus}
        onBatal={() => setBarangHapus(null)}
      />
    </div>
  );
}
