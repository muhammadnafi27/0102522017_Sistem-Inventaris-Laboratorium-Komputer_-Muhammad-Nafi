"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { InputPassword } from "@/komponen/input-password";
import { KELAS_INPUT_TEKS, KolomForm } from "@/komponen/kolom-form";
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
    <form onSubmit={tanganiSubmit} noValidate className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Masuk ke LabInventory</h2>
        <p className="mt-1 text-sm text-inactive">Masukkan email dan kata sandi untuk melanjutkan.</p>
      </div>

      {pesanUmum && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-delete">
          {pesanUmum}
        </p>
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

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-foreground">
          <input
            type="checkbox"
            checked={ingatSaya}
            onChange={(event) => setIngatSaya(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
          />
          Ingat saya
        </label>
        <span
          className="cursor-not-allowed text-inactive"
          title="Hubungi admin laboratorium untuk mereset password."
        >
          Lupa password?
        </span>
      </div>

      <button
        type="submit"
        disabled={sedangKirim}
        className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-update disabled:opacity-60"
      >
        {sedangKirim ? "Memproses..." : "Masuk"}
      </button>

      <p className="text-center text-sm text-inactive">
        Belum punya akun?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Daftar
        </Link>
      </p>
    </form>
  );
}
