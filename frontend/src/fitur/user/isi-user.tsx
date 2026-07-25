"use client";

import { useCallback, useEffect, useState } from "react";

import { Avatar } from "@/komponen/avatar";
import { BadgeRole } from "@/komponen/badge-role";
import { DialogKonfirmasi } from "@/komponen/dialog-konfirmasi";
import { IkonCari, IkonEdit, IkonHapus, IkonReset, IkonTambah } from "@/komponen/ikon";
import { KeadaanError, KeadaanKosong, SkeletonBaris } from "@/komponen/keadaan";
import { KELAS_INPUT_TEKS, KELAS_TOMBOL_UTAMA } from "@/komponen/kolom-form";
import { Paginasi } from "@/komponen/paginasi";
import { ModalFormUser } from "@/fitur/user/modal-form-user";
import { ModalResetPassword } from "@/fitur/user/modal-reset-password";
import { useAuth } from "@/konteks/auth-konteks";
import { useToast } from "@/konteks/toast-konteks";
import { useDebounce } from "@/hook/use-debounce";
import { OPSI_ROLE, LABEL_ROLE } from "@/konstanta/role";
import { daftarUser, hapusUser } from "@/layanan-api/user";
import { KesalahanApi } from "@/layanan-api/klien";
import type { Pengguna, RolePengguna } from "@/tipe/pengguna";
import type { MetaPagination } from "@/tipe/respons-api";
import { formatTanggal } from "@/utilitas/tanggal";

const LIMIT = 10;
type Status = "memuat" | "berhasil" | "gagal";

// Kelas dasar tombol aksi ikon pada baris tabel. Ukuran 36px agar tetap nyaman ditekan di
// layar sentuh, dengan ring fokus yang jelas untuk navigasi keyboard.
const KELAS_TOMBOL_AKSI =
  "flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-inactive transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

interface PropsTombolAksi {
  user: Pengguna;
  diriSendiri: boolean;
  onEdit: (user: Pengguna) => void;
  onReset: (user: Pengguna) => void;
  onHapus: (user: Pengguna) => void;
}

// Kelompok tombol aksi per baris. Didefinisikan di luar IsiUser (bukan sebagai komponen
// bersarang) supaya tidak dibuat ulang setiap render dan fokus keyboard tidak hilang.
// Dipakai dua kali - baris tabel desktop dan kartu mobile - sehingga aturan "tombol hapus
// disembunyikan untuk akun sendiri" cukup ditulis satu kali di sini.
function TombolAksiUser({ user, diriSendiri, onEdit, onReset, onHapus }: PropsTombolAksi) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onEdit(user)}
        aria-label={`Edit ${user.nama}`}
        title="Edit pengguna"
        className={`${KELAS_TOMBOL_AKSI} hover:border-blue-200 hover:bg-blue-50 hover:text-update`}
      >
        <IkonEdit className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => onReset(user)}
        aria-label={`Reset password ${user.nama}`}
        title="Reset password"
        className={`${KELAS_TOMBOL_AKSI} hover:border-amber-200 hover:bg-amber-50 hover:text-warning`}
      >
        <IkonReset className="h-5 w-5" />
      </button>
      {/* Tombol hapus disembunyikan untuk akun sendiri (PRD: cegah admin menghapus dirinya
          sendiri pada UI). Backend tetap menolak lagi sebagai lapisan pertahanan kedua bila
          ada percobaan lewat API langsung. */}
      {!diriSendiri && (
        <button
          type="button"
          onClick={() => onHapus(user)}
          aria-label={`Hapus ${user.nama}`}
          title="Hapus pengguna"
          className={`${KELAS_TOMBOL_AKSI} hover:border-red-200 hover:bg-red-50 hover:text-delete`}
        >
          <IkonHapus className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

// Halaman Manajemen User (admin saja). Search+filter+pagination dikelola lokal (tidak perlu
// disinkronkan ke URL seperti inventaris, karena halaman ini tidak ditautkan dari tempat lain).
export function IsiUser() {
  const { pengguna: penggunaAktif } = useAuth();
  const toast = useToast();

  const [searchInput, setSearchInput] = useState("");
  const searchDebounced = useDebounce(searchInput, 400);
  const [role, setRole] = useState<RolePengguna | "">("");
  const [halaman, setHalaman] = useState(1);

  const [status, setStatus] = useState<Status>("memuat");
  const [data, setData] = useState<Pengguna[]>([]);
  const [meta, setMeta] = useState<MetaPagination | null>(null);
  const [pesanError, setPesanError] = useState("");

  const [modalForm, setModalForm] = useState<{ terbuka: boolean; user: Pengguna | null }>({
    terbuka: false,
    user: null,
  });
  const [formKey, setFormKey] = useState(0);
  const [userResetPassword, setUserResetPassword] = useState<Pengguna | null>(null);
  const [userHapus, setUserHapus] = useState<Pengguna | null>(null);
  const [sedangHapus, setSedangHapus] = useState(false);

  const bukaForm = useCallback((u: Pengguna | null) => {
    setModalForm({ terbuka: true, user: u });
    setFormKey((n) => n + 1);
  }, []);

  // Reset halaman ke 1 dilakukan langsung di handler perubahan filter (bukan lewat useEffect)
  // agar tidak memicu render berantai; pemuatan data tetap menunggu debounce untuk search.
  function ubahSearch(nilai: string) {
    setSearchInput(nilai);
    setHalaman(1);
  }

  function ubahRole(nilai: RolePengguna | "") {
    setRole(nilai);
    setHalaman(1);
  }

  const muat = useCallback(async () => {
    setStatus("memuat");
    try {
      const { data: baris, meta: metaBaru } = await daftarUser({
        page: halaman,
        limit: LIMIT,
        search: searchDebounced || undefined,
        role: role || undefined,
      });
      setData(baris);
      setMeta(metaBaru ?? null);
      setStatus("berhasil");
    } catch (error) {
      setPesanError(error instanceof Error ? error.message : "Gagal memuat data pengguna.");
      setStatus("gagal");
    }
  }, [halaman, searchDebounced, role]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void muat();
  }, [muat]);

  async function setelahMutasiForm(pesan: string) {
    setModalForm({ terbuka: false, user: null });
    toast.tampilkanSukses(pesan);
    await muat();
  }

  async function setelahResetPassword(pesan: string) {
    setUserResetPassword(null);
    toast.tampilkanSukses(pesan);
  }

  async function konfirmasiHapus() {
    if (!userHapus) return;
    setSedangHapus(true);
    try {
      await hapusUser(userHapus.id);
      toast.tampilkanSukses("Pengguna berhasil dihapus.");
      setUserHapus(null);
      if (data.length === 1 && halaman > 1) setHalaman((h) => h - 1);
      else await muat();
    } catch (error) {
      // Menangkap error backend seperti "tidak dapat menghapus akun sendiri" atau
      // "tidak dapat menghapus admin terakhir" - pencegahan di UI (tombol disembunyikan untuk
      // diri sendiri) tetap dilengkapi penanganan error backend sebagai lapisan kedua.
      const pesan = error instanceof KesalahanApi ? error.message : "Gagal menghapus pengguna.";
      toast.tampilkanGagal(pesan);
      setUserHapus(null);
    } finally {
      setSedangHapus(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">Manajemen User</h1>
          <p className="mt-0.5 text-sm text-inactive">
            Kelola akun admin, operator, dan viewer beserta hak aksesnya.
          </p>
        </div>
        <button
          type="button"
          onClick={() => bukaForm(null)}
          className={`${KELAS_TOMBOL_UTAMA} self-start sm:self-auto`}
        >
          <IkonTambah className="h-4 w-4" />
          Tambah Pengguna
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-surface shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center">
          {/* Ikon kaca pembesar diposisikan absolut di dalam pembungkus agar input tetap satu
              elemen yang bisa difokuskan, bukan dua kontrol terpisah. */}
          <div className="relative flex-1">
            <IkonCari
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <input
              value={searchInput}
              onChange={(e) => ubahSearch(e.target.value)}
              placeholder="Cari nama atau email..."
              aria-label="Cari pengguna"
              className={`${KELAS_INPUT_TEKS} pl-10`}
            />
          </div>
          <select
            value={role}
            onChange={(e) => ubahRole(e.target.value as RolePengguna | "")}
            aria-label="Filter role"
            className={`${KELAS_INPUT_TEKS} sm:w-44`}
          >
            <option value="">Semua Role</option>
            {OPSI_ROLE.map((r) => (
              <option key={r} value={r}>
                {LABEL_ROLE[r]}
              </option>
            ))}
          </select>
        </div>

        {status === "memuat" && <SkeletonBaris jumlah={6} />}

        {status === "gagal" && (
          <div className="p-4">
            <KeadaanError pesan={pesanError} onCobaLagi={muat} />
          </div>
        )}

        {status === "berhasil" && data.length === 0 && (
          <KeadaanKosong pesan="Tidak ada pengguna yang cocok dengan pencarian atau filter Anda." />
        )}

        {status === "berhasil" && data.length > 0 && (
          <>
            {/* Tabel dipakai mulai lebar sm. Di bawah itu ruang horizontal tidak cukup untuk
                empat kolom, sehingga dipakai daftar kartu agar tidak perlu scroll menyamping. */}
            <div className="hidden sm:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/60 text-xs uppercase tracking-wide text-inactive">
                    <th className="px-4 py-3 font-semibold">Pengguna</th>
                    <th className="px-4 py-3 font-semibold">Role</th>
                    <th className="px-4 py-3 font-semibold">Terdaftar</th>
                    <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.map((u) => {
                    const diriSendiri = u.id === penggunaAktif?.id;
                    return (
                      <tr key={u.id} className="transition-colors hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar nama={u.nama} />
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-foreground">
                                {u.nama}
                                {diriSendiri && (
                                  <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[0.6875rem] font-semibold text-primary">
                                    Anda
                                  </span>
                                )}
                              </p>
                              <p className="truncate text-xs text-inactive">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <BadgeRole role={u.role} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-inactive">
                          {formatTanggal(u.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            <TombolAksiUser
                              user={u}
                              diriSendiri={diriSendiri}
                              onEdit={bukaForm}
                              onReset={setUserResetPassword}
                              onHapus={setUserHapus}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-slate-100 sm:hidden">
              {data.map((u) => {
                const diriSendiri = u.id === penggunaAktif?.id;
                return (
                  <li key={u.id} className="flex flex-col gap-3 p-4">
                    <div className="flex items-start gap-3">
                      <Avatar nama={u.nama} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-foreground">
                          {u.nama}
                          {diriSendiri && (
                            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[0.6875rem] font-semibold text-primary">
                              Anda
                            </span>
                          )}
                        </p>
                        <p className="truncate text-xs text-inactive">{u.email}</p>
                        <p className="mt-1 text-xs text-inactive">
                          Terdaftar {formatTanggal(u.created_at)}
                        </p>
                      </div>
                      <BadgeRole role={u.role} />
                    </div>
                    <TombolAksiUser
                      user={u}
                      diriSendiri={diriSendiri}
                      onEdit={bukaForm}
                      onReset={setUserResetPassword}
                      onHapus={setUserHapus}
                    />
                  </li>
                );
              })}
            </ul>

            {meta && <Paginasi meta={meta} onPindahHalaman={setHalaman} />}
          </>
        )}
      </div>

      <ModalFormUser
        key={formKey}
        terbuka={modalForm.terbuka}
        user={modalForm.user}
        onTutup={() => setModalForm({ terbuka: false, user: null })}
        onBerhasil={setelahMutasiForm}
      />

      <ModalResetPassword
        user={userResetPassword}
        onTutup={() => setUserResetPassword(null)}
        onBerhasil={setelahResetPassword}
      />

      <DialogKonfirmasi
        terbuka={userHapus !== null}
        judul="Hapus Pengguna"
        pesan={`Yakin ingin menghapus pengguna "${userHapus?.nama ?? ""}"? Tindakan ini tidak dapat dibatalkan.`}
        sedangProses={sedangHapus}
        onKonfirmasi={konfirmasiHapus}
        onBatal={() => setUserHapus(null)}
      />
    </div>
  );
}
