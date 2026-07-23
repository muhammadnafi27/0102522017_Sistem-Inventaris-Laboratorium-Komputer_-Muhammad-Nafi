import fs from 'fs/promises';
import path from 'path';

/** Folder yang diizinkan sebagai target penghapusan (keamanan path traversal) */
const FOLDER_DIIZINKAN = path.join(process.cwd(), 'unggahan');

/**
 * Menghapus file secara asinkron dengan penanganan error dan proteksi path traversal.
 * Hanya akan menghapus file yang berada di dalam folder `unggahan/`.
 *
 * @param filePath Path relatif file (misalnya: 'unggahan/barang/foto-123.jpg')
 * @returns true jika berhasil dihapus atau file sudah tidak ada, false jika akses ditolak atau gagal
 */
export const hapusFileAman = async (filePath: string): Promise<boolean> => {
  if (!filePath.trim()) return true;

  try {
    const absolutePath = path.resolve(filePath);

    // Cegah path traversal: pastikan target ada di dalam folder unggahan
    if (!absolutePath.startsWith(FOLDER_DIIZINKAN)) {
      console.warn(`[file-util] KEAMANAN: Percobaan hapus file di luar folder unggahan ditolak: "${filePath}"`);
      return false;
    }

    await fs.unlink(absolutePath);
    return true;
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error) {
      const errCode = (error as NodeJS.ErrnoException).code;
      if (errCode === 'ENOENT') {
        // File sudah tidak ada — dianggap sukses
        return true;
      }
    }
    console.error(`[file-util] Gagal menghapus file "${filePath}":`, error);
    return false;
  }
};
