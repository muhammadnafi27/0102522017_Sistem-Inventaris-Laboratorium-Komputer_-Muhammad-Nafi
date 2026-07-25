"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { IkonCentang, IkonPeringatan } from "@/komponen/ikon";
import { InputPassword } from "@/komponen/input-password";
import { KELAS_INPUT_TEKS, KELAS_TOMBOL_UTAMA, KolomForm } from "@/komponen/kolom-form";
import { SkeletonHalaman } from "@/komponen/skeleton-halaman";
import { useAuth } from "@/konteks/auth-konteks";
import { register } from "@/layanan-api/auth";
import { KesalahanApi } from "@/layanan-api/klien";

const POLA_EMAIL = /^\S+@\S+\.\S+$/;

interface FormState {
  nama: string;
  email: string;
  password: string;
  konfirmasiPassword: string;
}

const STATE_AWAL: FormState = { nama: "", email: "", password: "", konfirmasiPassword: "" };

// Validasi format sederhana di client, mencerminkan aturan bisnis backend (PRD 3.2): nama
// 3-120 karakter, email valid, password minimal 8 karakter dengan huruf dan angka.
function validasiClient(form: FormState): Record<string, string> {
  const kesalahan: Record<string, string> = {};

  if (form.nama.trim().length < 3 || form.nama.trim().length > 120) {
    kesalahan.nama = "Nama wajib diisi, 3-120 karakter.";
  }
  if (!form.email.trim()) {
    kesalahan.email = "Email wajib diisi.";
  } else if (!POLA_EMAIL.test(form.email.trim())) {
    kesalahan.email = "Format email tidak valid.";
  }
  if (form.password.length < 8) {
    kesalahan.password = "Password minimal 8 karakter.";
  } else if (!/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password)) {
    kesalahan.password = "Password harus mengandung huruf dan angka.";
  }
  if (form.konfirmasiPassword !== form.password) {
    kesalahan.konfirmasiPassword = "Konfirmasi password tidak cocok.";
  }

  return kesalahan;
}

export function FormRegister() {
  const router = useRouter();
  const { pengguna, memuat } = useAuth();

  const [form, setForm] = useState<FormState>(STATE_AWAL);
  const [sedangKirim, setSedangKirim] = useState(false);
  const [pesanUmum, setPesanUmum] = useState<string | null>(null);
  const [kesalahanField, setKesalahanField] = useState<Record<string, string>>({});
  const [berhasil, setBerhasil] = useState(false);

  useEffect(() => {
    if (!memuat && pengguna) {
      router.replace("/dashboard");
    }
  }, [memuat, pengguna, router]);

  function aturField<K extends keyof FormState>(field: K, nilai: FormState[K]) {
    setForm((sebelumnya) => ({ ...sebelumnya, [field]: nilai }));
  }

  async function tanganiSubmit(event: FormEvent) {
    event.preventDefault();
    setPesanUmum(null);

    const kesalahan = validasiClient(form);
    setKesalahanField(kesalahan);
    if (Object.keys(kesalahan).length > 0) {
      return;
    }

    setSedangKirim(true);
    try {
      // Role tidak pernah dikirim dari form - backend selalu memaksa role viewer untuk
      // register publik (FR-01), sehingga tidak ada pilihan role di form ini sama sekali.
      await register({
        nama: form.nama.trim(),
        email: form.email.trim(),
        password: form.password,
        konfirmasiPassword: form.konfirmasiPassword,
      });
      setBerhasil(true);
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

  if (memuat || pengguna) {
    return <SkeletonHalaman />;
  }

  if (berhasil) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
          <IkonCentang className="h-7 w-7" />
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Registrasi Berhasil</h2>
        <p className="text-sm leading-relaxed text-inactive">
          Akun Anda telah dibuat dengan role Viewer. Silakan masuk menggunakan email dan password
          yang baru saja didaftarkan.
        </p>
        <Link href="/login" className={`${KELAS_TOMBOL_UTAMA} w-full`}>
          Ke Halaman Masuk
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={tanganiSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Daftar Akun Baru</h2>
        <p className="mt-1.5 text-sm text-inactive">
          Akun baru otomatis mendapat role Viewer (hanya dapat melihat inventaris).
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

      <KolomForm id="nama" label="Nama" kesalahan={kesalahanField.nama}>
        <input
          id="nama"
          type="text"
          autoComplete="name"
          value={form.nama}
          onChange={(event) => aturField("nama", event.target.value)}
          className={KELAS_INPUT_TEKS}
          placeholder="Nama lengkap"
        />
      </KolomForm>

      <KolomForm id="email" label="Email" kesalahan={kesalahanField.email}>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(event) => aturField("email", event.target.value)}
          className={KELAS_INPUT_TEKS}
          placeholder="nama@lab.id"
        />
      </KolomForm>

      <KolomForm id="password" label="Password" kesalahan={kesalahanField.password}>
        <InputPassword
          id="password"
          value={form.password}
          onChange={(nilai) => aturField("password", nilai)}
          autoComplete="new-password"
          placeholder="Minimal 8 karakter, huruf dan angka"
        />
      </KolomForm>

      <KolomForm
        id="konfirmasiPassword"
        label="Konfirmasi Password"
        kesalahan={kesalahanField.konfirmasiPassword}
      >
        <InputPassword
          id="konfirmasiPassword"
          value={form.konfirmasiPassword}
          onChange={(nilai) => aturField("konfirmasiPassword", nilai)}
          autoComplete="new-password"
          placeholder="Ulangi password"
        />
      </KolomForm>

      <button type="submit" disabled={sedangKirim} className={`${KELAS_TOMBOL_UTAMA} w-full`}>
        {sedangKirim && (
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
          />
        )}
        {sedangKirim ? "Memproses..." : "Daftar"}
      </button>

      <p className="text-center text-sm text-inactive">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="rounded font-semibold text-primary transition-colors hover:text-update hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          Masuk
        </Link>
      </p>
    </form>
  );
}
