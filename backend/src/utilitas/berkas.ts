import fs from "node:fs/promises";
import path from "node:path";

import { FOLDER_UNGGAHAN_BARANG, NAMA_FOTO_DEFAULT } from "@/konfigurasi/unggahan";
import { logger } from "@/utilitas/logger";

// Memastikan folder upload foto barang tersedia sebelum server menerima request. Dipanggil
// sekali saat server start; aman dipanggil berulang karena recursive:true tidak error bila
// folder sudah ada.
export async function pastikanFolderUnggahanAda(): Promise<void> {
  await fs.mkdir(FOLDER_UNGGAHAN_BARANG, { recursive: true });
}

// Menghapus file foto barang secara aman: tidak pernah menghapus foto default, dan tidak
// melempar error bila file memang sudah tidak ada di disk (mis. sempat terhapus manual).
// Dipakai baik untuk membersihkan foto lama setelah update, maupun foto barang yang dihapus.
export async function hapusFotoBarang(namaFile: string | null | undefined): Promise<void> {
  if (!namaFile || namaFile === NAMA_FOTO_DEFAULT) {
    return;
  }

  const pathFile = path.join(FOLDER_UNGGAHAN_BARANG, namaFile);

  try {
    await fs.unlink(pathFile);
  } catch (error) {
    const kesalahan = error as NodeJS.ErrnoException;
    if (kesalahan.code !== "ENOENT") {
      logger.error(`Gagal menghapus file foto "${namaFile}"`, error);
    }
  }
}
