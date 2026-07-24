import { tutupPoolDatabase, ujiKoneksiDatabase } from "@/konfigurasi/database";
import { aktivitasRepository } from "@/repository/aktivitas.repository";
import { barangRepository } from "@/repository/barang.repository";
import { kategoriRepository } from "@/repository/kategori.repository";
import { usersRepository } from "@/repository/users.repository";

// Skrip CLI mandiri (bukan bagian dari server HTTP) untuk memverifikasi koneksi database
// dan jumlah data seed setelah database/inventaris.sql diimpor. Dijalankan lewat `npm run cek:db`.
async function utama(): Promise<void> {
  console.log("Memeriksa koneksi ke database...");
  await ujiKoneksiDatabase();

  const [totalKategori, totalBarang, totalUser, totalAktivitas] = await Promise.all([
    kategoriRepository.cariSemua().then((baris) => baris.length),
    barangRepository.hitungSemua(),
    usersRepository.hitungSemua(),
    aktivitasRepository.hitungSemua(),
  ]);

  console.log("Jumlah data pada database:");
  console.table({
    kategori_barang: totalKategori,
    barang: totalBarang,
    users: totalUser,
    aktivitas_sistem: totalAktivitas,
  });

  const kategoriSesuai = totalKategori === 6;
  const barangSesuai = totalBarang === 10;
  const userSesuai = totalUser === 3;

  if (kategoriSesuai && barangSesuai && userSesuai) {
    console.log("Seed data sesuai target PRD: 6 kategori, 10 barang, 3 user.");
  } else {
    console.warn(
      "Seed data TIDAK sesuai target PRD (6 kategori, 10 barang, 3 user). " +
        "Impor ulang database/inventaris.sql pada database yang bersih.",
    );
  }
}

utama()
  .catch((error) => {
    console.error("Pemeriksaan koneksi gagal:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await tutupPoolDatabase();
  });
