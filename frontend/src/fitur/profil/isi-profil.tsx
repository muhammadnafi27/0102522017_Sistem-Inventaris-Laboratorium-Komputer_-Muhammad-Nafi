"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

import { Avatar } from "@/komponen/avatar";
import { BadgeRole } from "@/komponen/badge-role";
import { KeadaanError } from "@/komponen/keadaan";
import { KELAS_INPUT_TEKS, KolomForm } from "@/komponen/kolom-form";
import { useAuth } from "@/konteks/auth-konteks";
import { useToast } from "@/konteks/toast-konteks";
import { KesalahanApi } from "@/layanan-api/klien";
import { ambilProfil, perbaruiProfil } from "@/layanan-api/profil";
import type { Pengguna } from "@/tipe/pengguna";
import { formatTanggal } from "@/utilitas/tanggal";

type Status = "memuat" | "berhasil" | "gagal";

// Halaman Profil - terbuka untuk semua role. Setiap pengguna hanya dapat melihat/mengubah
// datanya sendiri (endpoint /api/profil selalu mengacu ke pengguna yang sedang login).
// Role ditampilkan sebagai badge dan sengaja TIDAK dapat diubah sendiri (PRD 4.4/9).
export function IsiProfil() {
  const { aturPengguna } = useAuth();
  const toast = useToast();

  const [status, setStatus] = useState<Status>("memuat");
  const [profil, setProfil] = useState<Pengguna | null>(null);
  const [pesanError, setPesanError] = useState("");

  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [errorField, setErrorField] = useState<Record<string, string>>({});
  const [pesanUmum, setPesanUmum] = useState("");
  const [sedangKirim, setSedangKirim] = useState(false);

  const muat = useCallback(async () => {
    setStatus("memuat");
    try {
      const data = await ambilProfil();
      setProfil(data);
      setNama(data.nama);
      setEmail(data.email);
      setStatus("berhasil");
    } catch (error) {
      setPesanError(error instanceof Error ? error.message : "Gagal memuat profil.");
      setStatus("gagal");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void muat();
  }, [muat]);

  async function tanganiSubmit(event: FormEvent) {
    event.preventDefault();
    setPesanUmum("");

    const err: Record<string, string> = {};
    if (nama.trim().length < 3) err.nama = "Nama minimal 3 karakter.";
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) err.email = "Format email tidak valid.";
    setErrorField(err);
    if (Object.keys(err).length > 0) return;

    setSedangKirim(true);
    try {
      const diperbarui = await perbaruiProfil({ nama: nama.trim(), email: email.trim() });
      setProfil(diperbarui);
      // Perbarui juga konteks auth global agar nama di header/sidebar langsung ikut berubah.
      aturPengguna(diperbarui);
      toast.tampilkanSukses("Profil berhasil diperbarui.");
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

  if (status === "memuat") {
    return <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />;
  }

  if (status === "gagal" || !profil) {
    return <KeadaanError pesan={pesanError} onCobaLagi={muat} />;
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">Profil</h1>
        <p className="mt-0.5 text-sm text-inactive">Kelola identitas akun Anda.</p>
      </div>

      <div className="max-w-xl rounded-2xl border border-slate-200/80 bg-surface p-6 shadow-sm">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
          <div className="scale-150">
            <Avatar nama={profil.nama} />
          </div>
          <div className="ml-2">
            <p className="text-lg font-semibold text-foreground">{profil.nama}</p>
            <div className="mt-1 flex items-center gap-2">
              <BadgeRole role={profil.role} />
              <span className="text-xs text-inactive">Bergabung {formatTanggal(profil.created_at)}</span>
            </div>
          </div>
        </div>

        <form onSubmit={tanganiSubmit} noValidate className="mt-5 flex flex-col gap-4">
          {pesanUmum && (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-delete">
              {pesanUmum}
            </p>
          )}

          <KolomForm id="nama" label="Nama" kesalahan={errorField.nama}>
            <input
              id="nama"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className={KELAS_INPUT_TEKS}
            />
          </KolomForm>

          <KolomForm id="email" label="Email" kesalahan={errorField.email}>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={KELAS_INPUT_TEKS}
            />
          </KolomForm>

          <KolomForm id="role" label="Role">
            <div className={`${KELAS_INPUT_TEKS} flex cursor-not-allowed items-center bg-slate-50 text-inactive`}>
              <BadgeRole role={profil.role} />
              <span className="ml-2 text-xs">Role hanya dapat diubah oleh admin</span>
            </div>
          </KolomForm>

          <div className="mt-1 flex justify-end">
            <button
              type="submit"
              disabled={sedangKirim}
              className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-update disabled:opacity-60"
            >
              {sedangKirim ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
