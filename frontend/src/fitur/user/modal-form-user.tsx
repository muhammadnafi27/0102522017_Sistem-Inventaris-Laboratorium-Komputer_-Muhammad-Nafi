"use client";

import { useState, type FormEvent } from "react";

import { InputPassword } from "@/komponen/input-password";
import { KELAS_INPUT_TEKS, KolomForm } from "@/komponen/kolom-form";
import { Modal } from "@/komponen/modal";
import { LABEL_ROLE, OPSI_ROLE } from "@/konstanta/role";
import { KesalahanApi } from "@/layanan-api/klien";
import { buatUser, perbaruiUser } from "@/layanan-api/user";
import type { Pengguna, RolePengguna } from "@/tipe/pengguna";

interface PropsModalFormUser {
  terbuka: boolean;
  // User yang diedit; null berarti mode tambah.
  user: Pengguna | null;
  onTutup: () => void;
  onBerhasil: (pesan: string) => void;
}

interface StateForm {
  nama: string;
  email: string;
  password: string;
  role: RolePengguna;
}

function validasiClient(nilai: StateForm, modeEdit: boolean): Record<string, string> {
  const err: Record<string, string> = {};
  if (nilai.nama.trim().length < 3) err.nama = "Nama minimal 3 karakter.";
  if (!/^\S+@\S+\.\S+$/.test(nilai.email.trim())) err.email = "Format email tidak valid.";
  if (!modeEdit) {
    if (nilai.password.length < 8) err.password = "Password minimal 8 karakter.";
    else if (!/[A-Za-z]/.test(nilai.password) || !/[0-9]/.test(nilai.password)) {
      err.password = "Password harus mengandung huruf dan angka.";
    }
  }
  return err;
}

// Modal form tambah/edit user (admin saja). Field password hanya muncul pada mode tambah -
// mengubah password user lain dilakukan lewat modal reset password terpisah (sesuai kontrak
// backend: PUT /api/users/:id tidak menerima password).
export function ModalFormUser({ terbuka, user, onTutup, onBerhasil }: PropsModalFormUser) {
  const modeEdit = user !== null;

  const [nilai, setNilai] = useState<StateForm>(() => ({
    nama: user?.nama ?? "",
    email: user?.email ?? "",
    password: "",
    role: user?.role ?? "viewer",
  }));
  const [errorField, setErrorField] = useState<Record<string, string>>({});
  const [pesanUmum, setPesanUmum] = useState("");
  const [sedangKirim, setSedangKirim] = useState(false);

  async function tanganiSubmit(event: FormEvent) {
    event.preventDefault();
    setPesanUmum("");

    const err = validasiClient(nilai, modeEdit);
    setErrorField(err);
    if (Object.keys(err).length > 0) return;

    setSedangKirim(true);
    try {
      if (modeEdit && user) {
        await perbaruiUser(user.id, { nama: nilai.nama, email: nilai.email, role: nilai.role });
        onBerhasil("Pengguna berhasil diperbarui.");
      } else {
        await buatUser({
          nama: nilai.nama,
          email: nilai.email,
          password: nilai.password,
          role: nilai.role,
        });
        onBerhasil("Pengguna berhasil ditambahkan.");
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
    <Modal terbuka={terbuka} judul={modeEdit ? "Edit Pengguna" : "Tambah Pengguna"} onTutup={onTutup} lebar="md">
      <form onSubmit={tanganiSubmit} noValidate className="flex flex-col gap-4">
        {pesanUmum && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-delete">
            {pesanUmum}
          </p>
        )}

        <KolomForm id="nama" label="Nama" kesalahan={errorField.nama}>
          <input
            id="nama"
            value={nilai.nama}
            onChange={(e) => setNilai((s) => ({ ...s, nama: e.target.value }))}
            className={KELAS_INPUT_TEKS}
            placeholder="Nama lengkap"
          />
        </KolomForm>

        <KolomForm id="email" label="Email" kesalahan={errorField.email}>
          <input
            id="email"
            type="email"
            value={nilai.email}
            onChange={(e) => setNilai((s) => ({ ...s, email: e.target.value }))}
            className={KELAS_INPUT_TEKS}
            placeholder="nama@lab.id"
          />
        </KolomForm>

        {!modeEdit && (
          <KolomForm id="password" label="Password" kesalahan={errorField.password}>
            <InputPassword
              id="password"
              value={nilai.password}
              onChange={(v) => setNilai((s) => ({ ...s, password: v }))}
              autoComplete="new-password"
              placeholder="Minimal 8 karakter, huruf dan angka"
            />
          </KolomForm>
        )}

        <KolomForm id="role" label="Role" kesalahan={errorField.role}>
          <select
            id="role"
            value={nilai.role}
            onChange={(e) => setNilai((s) => ({ ...s, role: e.target.value as RolePengguna }))}
            className={KELAS_INPUT_TEKS}
          >
            {OPSI_ROLE.map((r) => (
              <option key={r} value={r}>
                {LABEL_ROLE[r]}
              </option>
            ))}
          </select>
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
            {sedangKirim ? "Menyimpan..." : "Simpan Pengguna"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
