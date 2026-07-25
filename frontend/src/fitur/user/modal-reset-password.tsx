"use client";

import { useState, type FormEvent } from "react";

import { InputPassword } from "@/komponen/input-password";
import { KolomForm } from "@/komponen/kolom-form";
import { Modal } from "@/komponen/modal";
import { KesalahanApi } from "@/layanan-api/klien";
import { resetPasswordUser } from "@/layanan-api/user";
import type { Pengguna } from "@/tipe/pengguna";

interface PropsModalResetPassword {
  user: Pengguna | null;
  onTutup: () => void;
  onBerhasil: (pesan: string) => void;
}

function validasiClient(passwordBaru: string, konfirmasi: string): Record<string, string> {
  const err: Record<string, string> = {};
  if (passwordBaru.length < 8) err.passwordBaru = "Password minimal 8 karakter.";
  else if (!/[A-Za-z]/.test(passwordBaru) || !/[0-9]/.test(passwordBaru)) {
    err.passwordBaru = "Password harus mengandung huruf dan angka.";
  }
  if (konfirmasi !== passwordBaru) err.konfirmasiPassword = "Konfirmasi password tidak cocok.";
  return err;
}

// Modal reset password khusus admin. Tidak ada alur email/SMTP - admin langsung menetapkan
// password baru untuk pengguna (PRD 6: "Tidak perlu SMTP untuk baseline").
export function ModalResetPassword({ user, onTutup, onBerhasil }: PropsModalResetPassword) {
  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");
  const [errorField, setErrorField] = useState<Record<string, string>>({});
  const [pesanUmum, setPesanUmum] = useState("");
  const [sedangKirim, setSedangKirim] = useState(false);

  async function tanganiSubmit(event: FormEvent) {
    event.preventDefault();
    setPesanUmum("");

    const err = validasiClient(passwordBaru, konfirmasiPassword);
    setErrorField(err);
    if (Object.keys(err).length > 0) return;

    if (!user) return;
    setSedangKirim(true);
    try {
      await resetPasswordUser(user.id, { passwordBaru, konfirmasiPassword });
      onBerhasil(`Password untuk ${user.nama} berhasil direset.`);
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
    <Modal terbuka={user !== null} judul="Reset Password" onTutup={onTutup} lebar="md">
      <form onSubmit={tanganiSubmit} noValidate className="flex flex-col gap-4">
        <p className="text-sm text-inactive">
          Menetapkan password baru untuk <span className="font-medium text-foreground">{user?.nama}</span>{" "}
          ({user?.email}). Pengguna dapat langsung login memakai password baru ini.
        </p>

        {pesanUmum && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-delete">
            {pesanUmum}
          </p>
        )}

        <KolomForm id="passwordBaru" label="Password Baru" kesalahan={errorField.passwordBaru}>
          <InputPassword
            id="passwordBaru"
            value={passwordBaru}
            onChange={setPasswordBaru}
            autoComplete="new-password"
            placeholder="Minimal 8 karakter, huruf dan angka"
          />
        </KolomForm>

        <KolomForm
          id="konfirmasiPassword"
          label="Konfirmasi Password Baru"
          kesalahan={errorField.konfirmasiPassword}
        >
          <InputPassword
            id="konfirmasiPassword"
            value={konfirmasiPassword}
            onChange={setKonfirmasiPassword}
            autoComplete="new-password"
            placeholder="Ulangi password baru"
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
            {sedangKirim ? "Memproses..." : "Reset Password"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
