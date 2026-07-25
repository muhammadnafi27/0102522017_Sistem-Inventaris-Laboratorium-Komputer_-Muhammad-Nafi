"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { IkonPeringatan } from "@/komponen/ikon";
import { InputPassword } from "@/komponen/input-password";
import { KELAS_INPUT_TEKS, KELAS_TOMBOL_UTAMA, KolomForm } from "@/komponen/kolom-form";
import { SkeletonHalaman } from "@/komponen/skeleton-halaman";
import { useAuth } from "@/konteks/auth-konteks";
import { login } from "@/layanan-api/auth";
import { KesalahanApi } from "@/layanan-api/klien";

// Validasi format email sederhana di sisi client. Aturan lengkap (keunikan, dsb) tetap
// ditegakkan backend - ini hanya memberi umpan balik cepat sebelum request dikirim.
const POLA_EMAIL = /^\S+@\S+\.\S+$/;

export function FormLogin() {
  const router = useRouter();
  const { pengguna, memuat, aturPengguna } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ingatSaya, setIngatSaya] = useState(false);
  // Petunjuk "Lupa password?" dibuat sebagai state, bukan atribut title, agar pesannya juga
  // terbaca oleh pengguna keyboard dan screen reader (title hanya muncul saat hover mouse).
  const [tampilBantuanLupa, setTampilBantuanLupa] = useState(false);
  const [sedangKirim, setSedangKirim] = useState(false);
  const [pesanUmum, setPesanUmum] = useState<string | null>(null);
  const [kesalahanField, setKesalahanField] = useState<Record<string, string>>({});

  // Pengguna yang sudah login tidak perlu melihat form login lagi - langsung arahkan ke dashboard.
  useEffect(() => {
    if (!memuat && pengguna) {
      router.replace("/dashboard");
    }
  }, [memuat, pengguna, router]);

  function validasiClient(): boolean {
    const kesalahan: Record<string, string> = {};
    if (!email.trim()) {
      kesalahan.email = "Email wajib diisi.";
    } else if (!POLA_EMAIL.test(email.trim())) {
      kesalahan.email = "Format email tidak valid.";
    }
    if (!password) {
      kesalahan.password = "Password wajib diisi.";
    }
    setKesalahanField(kesalahan);
    return Object.keys(kesalahan).length === 0;
  }

  async function tanganiSubmit(event: FormEvent) {
    event.preventDefault();
    setPesanUmum(null);

    if (!validasiClient()) {
      return;
    }

    setSedangKirim(true);
    try {
      const penggunaBaru = await login({ email: email.trim(), password, ingatSaya });
      aturPengguna(penggunaBaru);
      router.replace("/dashboard");
    } catch (error) {
      if (error instanceof KesalahanApi) {
        if (error.kesalahan && error.kesalahan.length > 0) {
          const peta: Record<string, string> = {};
          for (const item of error.kesalahan) {
            peta[item.field] = item.pesan;
          }
          setKesalahanField(peta);
        }
        setPesanUmum(error.message);
      } else {
        setPesanUmum("Terjadi kesalahan yang tidak terduga. Silakan coba lagi.");
      }
    } finally {
      setSedangKirim(false);
    }
  }

  // Selagi AuthProvider memeriksa sesi awal, atau pengguna ternyata sudah login (menunggu
  // redirect efek di atas), tampilkan skeleton alih-alih form agar tidak ada kedipan konten.
  if (memuat || pengguna) {
    return <SkeletonHalaman />;
  }

  return (
    <form onSubmit={tanganiSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Selamat Datang Kembali</h2>
        <p className="mt-1.5 text-sm text-inactive">
          Masuk untuk mengelola inventaris laboratorium komputer.
        </p>
      </div>

      {pesanUmum && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-delete"
        >
          <IkonPeringatan className="mt-px h-4 w-4 shrink-0" />
          <span>{pesanUmum}</span>
        </div>
      )}

      <KolomForm id="email" label="Email" kesalahan={kesalahanField.email}>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={KELAS_INPUT_TEKS}
          placeholder="nama@lab.id"
        />
      </KolomForm>

      <KolomForm id="password" label="Password" kesalahan={kesalahanField.password}>
        <InputPassword
          id="password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          placeholder="Masukkan password"
        />
      </KolomForm>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <label className="flex cursor-pointer items-center gap-2 text-foreground">
          <input
            type="checkbox"
            checked={ingatSaya}
            onChange={(event) => setIngatSaya(event.target.checked)}
            className="h-4 w-4 cursor-pointer rounded border-slate-300 text-primary focus-visible:ring-2 focus-visible:ring-primary/40"
          />
          Ingat saya
        </label>
        <button
          type="button"
          onClick={() => setTampilBantuanLupa((sebelumnya) => !sebelumnya)}
          aria-expanded={tampilBantuanLupa}
          aria-controls="bantuan-lupa-password"
          className="rounded font-medium text-primary transition-colors hover:text-update hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          Lupa password?
        </button>
      </div>

      {tampilBantuanLupa && (
        <p
          id="bantuan-lupa-password"
          className="-mt-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs leading-relaxed text-inactive"
        >
          Reset password hanya dapat dilakukan oleh admin laboratorium melalui menu Manajemen User.
          Silakan hubungi admin untuk mendapatkan password baru.
        </p>
      )}

      <button type="submit" disabled={sedangKirim} className={`${KELAS_TOMBOL_UTAMA} w-full py-2.5`}>
        {sedangKirim && (
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
          />
        )}
        {sedangKirim ? "Memproses..." : "Masuk"}
      </button>

      <p className="text-center text-sm text-inactive">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="rounded font-semibold text-primary transition-colors hover:text-update hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          Daftar sebagai Viewer
        </Link>
      </p>
    </form>
  );
}
