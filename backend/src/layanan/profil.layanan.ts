import { aktivitasRepository } from "@/repository/aktivitas.repository";
import { usersRepository } from "@/repository/users.repository";
import { KesalahanAplikasi } from "@/tipe/kesalahan-aplikasi";
import { keAmanPengguna, type PenggunaAman } from "@/tipe/pengguna-aman";

export interface DataPerbaruiProfil {
  nama: string;
  email?: string;
}

export const profilLayanan = {
  async lihat(penggunaId: number): Promise<PenggunaAman> {
    const baris = await usersRepository.cariById(penggunaId);
    if (!baris) {
      throw new KesalahanAplikasi(404, "Pengguna tidak ditemukan.");
    }
    return keAmanPengguna(baris);
  },

  // Pengguna hanya dapat mengubah nama dan (opsional) email miliknya sendiri. Role sengaja
  // tidak menerima input di sini - role tampil sebagai badge dan tidak dapat diubah sendiri.
  async perbarui(penggunaId: number, data: DataPerbaruiProfil): Promise<PenggunaAman> {
    const existing = await usersRepository.cariById(penggunaId);
    if (!existing) {
      throw new KesalahanAplikasi(404, "Pengguna tidak ditemukan.");
    }

    const email = data.email ? data.email.trim().toLowerCase() : existing.email;

    if (email !== existing.email) {
      const duplikat = await usersRepository.cariByEmail(email);
      if (duplikat && duplikat.id !== penggunaId) {
        throw new KesalahanAplikasi(409, "Email sudah digunakan.", [
          { field: "email", pesan: "Email sudah digunakan." },
        ]);
      }
    }

    await usersRepository.perbarui(penggunaId, {
      nama: data.nama.trim(),
      email,
      role: existing.role,
    });

    await aktivitasRepository.catat({
      user_id: penggunaId,
      aksi: "UPDATE",
      entitas: "profil",
      entitas_id: penggunaId,
      detail: "Memperbarui profil sendiri.",
      ip_address: null,
    });

    return this.lihat(penggunaId);
  },
};
