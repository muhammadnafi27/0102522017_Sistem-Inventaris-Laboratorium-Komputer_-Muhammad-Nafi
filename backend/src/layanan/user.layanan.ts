import bcrypt from "bcrypt";

import { aktivitasRepository } from "@/repository/aktivitas.repository";
import { usersRepository } from "@/repository/users.repository";
import type { RolePengguna } from "@/tipe/basis-data";
import { KesalahanAplikasi } from "@/tipe/kesalahan-aplikasi";
import { keAmanPengguna, type PenggunaAman } from "@/tipe/pengguna-aman";
import type { MetaPagination } from "@/utilitas/respons";
import { jalankanTransaksi } from "@/utilitas/transaksi";

const BCRYPT_COST = 10;
const BATAS_DEFAULT = 10;
const BATAS_MAKSIMUM = 100;

export interface QueryDaftarUser {
  page?: number;
  limit?: number;
  search?: string;
  role?: RolePengguna;
}

export interface DataBuatUserMasuk {
  nama: string;
  email: string;
  password: string;
  role: RolePengguna;
}

export interface DataPerbaruiUserMasuk {
  nama: string;
  email: string;
  role: RolePengguna;
}

export interface DataResetPasswordMasuk {
  passwordBaru: string;
  konfirmasiPassword: string;
}

// Memastikan aksi yang menghapus/menurunkan role admin tertentu tidak membuat sistem
// kehilangan admin aktif terakhir (aturan bisnis PRD 3.2).
async function pastikanBukanAdminTerakhir(pesan: string): Promise<void> {
  const jumlahAdmin = await usersRepository.hitungAdmin();
  if (jumlahAdmin <= 1) {
    throw new KesalahanAplikasi(409, pesan);
  }
}

export const userLayanan = {
  async daftar(query: QueryDaftarUser): Promise<{ data: PenggunaAman[]; meta: MetaPagination }> {
    const halaman = Math.max(1, query.page ?? 1);
    const batas = Math.min(BATAS_MAKSIMUM, Math.max(1, query.limit ?? BATAS_DEFAULT));
    const filter = { search: query.search?.trim() || undefined, role: query.role };

    const [baris, totalData] = await Promise.all([
      usersRepository.cariDenganFilter({ ...filter, halaman, batas }),
      usersRepository.hitungDenganFilter(filter),
    ]);

    const totalHalaman = totalData === 0 ? 1 : Math.ceil(totalData / batas);

    return { data: baris.map(keAmanPengguna), meta: { halaman, batas, totalData, totalHalaman } };
  },

  async detail(id: number): Promise<PenggunaAman> {
    const baris = await usersRepository.cariById(id);
    if (!baris) {
      throw new KesalahanAplikasi(404, "Pengguna tidak ditemukan.");
    }
    return keAmanPengguna(baris);
  },

  async buat(data: DataBuatUserMasuk, penggunaAdminId: number): Promise<PenggunaAman> {
    const email = data.email.trim().toLowerCase();

    const sudahAda = await usersRepository.cariByEmail(email);
    if (sudahAda) {
      throw new KesalahanAplikasi(409, "Email sudah digunakan.", [
        { field: "email", pesan: "Email sudah digunakan." },
      ]);
    }

    const passwordHash = await bcrypt.hash(data.password, BCRYPT_COST);

    const id = await jalankanTransaksi(async (koneksi) => {
      const idBaru = await usersRepository.buat(
        { nama: data.nama.trim(), email, password: passwordHash, role: data.role },
        koneksi,
      );
      await aktivitasRepository.catat(
        {
          user_id: penggunaAdminId,
          aksi: "CREATE",
          entitas: "user",
          entitas_id: idBaru,
          detail: `Menambahkan user ${email} dengan role ${data.role}.`,
          ip_address: null,
        },
        koneksi,
      );
      return idBaru;
    });

    return this.detail(id);
  },

  async perbarui(
    id: number,
    data: DataPerbaruiUserMasuk,
    penggunaAdminId: number,
  ): Promise<PenggunaAman> {
    const existing = await usersRepository.cariById(id);
    if (!existing) {
      throw new KesalahanAplikasi(404, "Pengguna tidak ditemukan.");
    }

    const email = data.email.trim().toLowerCase();
    const duplikat = await usersRepository.cariByEmail(email);
    if (duplikat && duplikat.id !== id) {
      throw new KesalahanAplikasi(409, "Email sudah digunakan.", [
        { field: "email", pesan: "Email sudah digunakan." },
      ]);
    }

    // Jangan sampai role admin terakhir diturunkan menjadi operator/viewer.
    if (existing.role === "admin" && data.role !== "admin") {
      await pastikanBukanAdminTerakhir(
        "Tidak dapat mengubah role admin terakhir. Sistem harus memiliki minimal satu admin aktif.",
      );
    }

    await jalankanTransaksi(async (koneksi) => {
      await usersRepository.perbarui(id, { nama: data.nama.trim(), email, role: data.role }, koneksi);
      await aktivitasRepository.catat(
        {
          user_id: penggunaAdminId,
          aksi: "UPDATE",
          entitas: "user",
          entitas_id: id,
          detail: `Memperbarui data user ${email}.`,
          ip_address: null,
        },
        koneksi,
      );
    });

    return this.detail(id);
  },

  async hapus(id: number, penggunaAdminId: number): Promise<void> {
    const existing = await usersRepository.cariById(id);
    if (!existing) {
      throw new KesalahanAplikasi(404, "Pengguna tidak ditemukan.");
    }

    if (id === penggunaAdminId) {
      throw new KesalahanAplikasi(409, "Anda tidak dapat menghapus akun sendiri.");
    }

    if (existing.role === "admin") {
      await pastikanBukanAdminTerakhir(
        "Tidak dapat menghapus admin terakhir. Sistem harus memiliki minimal satu admin aktif.",
      );
    }

    await jalankanTransaksi(async (koneksi) => {
      await usersRepository.hapus(id, koneksi);
      await aktivitasRepository.catat(
        {
          user_id: penggunaAdminId,
          aksi: "DELETE",
          entitas: "user",
          entitas_id: id,
          detail: `Menghapus user ${existing.email}.`,
          ip_address: null,
        },
        koneksi,
      );
    });
  },

  async resetPassword(
    id: number,
    data: DataResetPasswordMasuk,
    penggunaAdminId: number,
  ): Promise<void> {
    const existing = await usersRepository.cariById(id);
    if (!existing) {
      throw new KesalahanAplikasi(404, "Pengguna tidak ditemukan.");
    }

    const passwordHash = await bcrypt.hash(data.passwordBaru, BCRYPT_COST);

    await jalankanTransaksi(async (koneksi) => {
      await usersRepository.perbaruiPassword(id, passwordHash, koneksi);
      // Aktivitas dicatat tanpa menyimpan password baru sama sekali, hanya penanda bahwa
      // reset telah dilakukan dan oleh siapa.
      await aktivitasRepository.catat(
        {
          user_id: penggunaAdminId,
          aksi: "RESET_PASSWORD",
          entitas: "user",
          entitas_id: id,
          detail: `Reset password untuk user ${existing.email}.`,
          ip_address: null,
        },
        koneksi,
      );
    });
  },
};
