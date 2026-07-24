import bcrypt from "bcrypt";

import { aktivitasRepository } from "@/repository/aktivitas.repository";
import { usersRepository } from "@/repository/users.repository";
import { KesalahanAplikasi } from "@/tipe/kesalahan-aplikasi";
import { keAmanPengguna, type PenggunaAman } from "@/tipe/pengguna-aman";
import { buatToken } from "@/utilitas/jwt";

// Cost factor bcrypt sesuai standar keamanan minimal pada PRD (10-12).
const BCRYPT_COST = 10;

// Pesan generik untuk kegagalan login. Dipakai baik saat email tidak ditemukan maupun saat
// password salah, agar penyerang tidak bisa menyimpulkan email mana yang terdaftar (user enumeration).
const PESAN_KREDENSIAL_SALAH = "Email atau password salah.";

export interface DataRegister {
  nama: string;
  email: string;
  password: string;
}

export const authLayanan = {
  // Register publik selalu membuat akun dengan role viewer. Role tidak pernah diambil dari
  // request body agar tidak ada celah privilege escalation lewat endpoint publik.
  async register(data: DataRegister): Promise<PenggunaAman> {
    const email = data.email.trim().toLowerCase();

    const emailSudahAda = await usersRepository.cariByEmail(email);
    if (emailSudahAda) {
      throw new KesalahanAplikasi(409, "Email sudah terdaftar.", [
        { field: "email", pesan: "Email sudah digunakan." },
      ]);
    }

    const passwordHash = await bcrypt.hash(data.password, BCRYPT_COST);

    const id = await usersRepository.buat({
      nama: data.nama.trim(),
      email,
      password: passwordHash,
      role: "viewer",
    });

    const baris = await usersRepository.cariById(id);
    if (!baris) {
      throw new KesalahanAplikasi(500, "Gagal membuat akun. Silakan coba lagi.");
    }

    return keAmanPengguna(baris);
  },

  // Memverifikasi kredensial, mencatat aktivitas LOGIN, dan menerbitkan JWT.
  async login(
    email: string,
    password: string,
    ingatSaya: boolean,
    ipAddress: string | undefined,
  ): Promise<{ pengguna: PenggunaAman; token: string }> {
    const emailNormal = email.trim().toLowerCase();
    const baris = await usersRepository.cariByEmail(emailNormal);

    if (!baris) {
      throw new KesalahanAplikasi(401, PESAN_KREDENSIAL_SALAH);
    }

    const passwordCocok = await bcrypt.compare(password, baris.password);
    if (!passwordCocok) {
      throw new KesalahanAplikasi(401, PESAN_KREDENSIAL_SALAH);
    }

    const token = buatToken({ sub: baris.id, email: baris.email, role: baris.role }, ingatSaya);

    await aktivitasRepository.catat({
      user_id: baris.id,
      aksi: "LOGIN",
      entitas: "auth",
      entitas_id: null,
      detail: `${baris.nama} berhasil login.`,
      ip_address: ipAddress ?? null,
    });

    return { pengguna: keAmanPengguna(baris), token };
  },
};
