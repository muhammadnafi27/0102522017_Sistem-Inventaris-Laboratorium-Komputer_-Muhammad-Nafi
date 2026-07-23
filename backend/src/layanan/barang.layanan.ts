import BarangRepositori, { DataBarang, ParameterPencarianBarang, HasilPaginasi, InputDataBarang } from '../repositori/barang.repositori';
import KategoriRepositori from '../repositori/kategori.repositori';
import { AppError } from '../utilitas/AppError';
import { skemaBarang } from '../validasi/barang.validasi';
import { hapusFileAman } from '../utilitas/file';

class BarangLayanan {
  async dapatkanSemuaBarang(params: ParameterPencarianBarang): Promise<HasilPaginasi<DataBarang>> {
    return await BarangRepositori.getAll(params);
  }

  async dapatkanBarangBerdasarkanId(id: number): Promise<DataBarang> {
    const barang = await BarangRepositori.getById(id);
    if (!barang) {
      throw new AppError('Barang tidak ditemukan', 404);
    }
    return barang;
  }

  /**
   * Membuat barang baru dan menyimpan foto ke disk.
   * 
   * Strategi Rollback Foto:
   * - Validasi input dan pengecekan duplikasi HARUS dilakukan SEBELUM menyimpan file.
   *   Namun karena Multer menyimpan file ke disk SEBELUM kontroler berjalan, kita perlu
   *   cleanup jika ada error bisnis SETELAH file tersimpan.
   * - Rollback HANYA dilakukan untuk error yang terjadi SETELAH validasi (saat DB operation gagal).
   *   Error validasi dan duplikat kode sudah pasti tidak membutuhkan rollback DB,
   *   namun FILE sudah terlanjur tersimpan oleh Multer, sehingga harus dibersihkan.
   */
  async buatBarang(data: unknown, pathFoto?: string): Promise<DataBarang> {
    let filePerluDibersihkan = false; // Lacak apakah file sudah tersimpan ke disk

    try {
      // Validasi input Zod (belum ada file yang perlu dirollback — Multer sudah simpan filenya)
      const hasilValidasi = skemaBarang.safeParse(data);
      if (!hasilValidasi.success) {
        filePerluDibersihkan = true; // File sudah ada di disk, harus dihapus
        const pesanError = hasilValidasi.error.issues.map(err => err.message).join(', ');
        throw new AppError(pesanError, 400);
      }

      const dataTervalidasi = hasilValidasi.data;

      // Pastikan kategori ada
      const kategori = await KategoriRepositori.getById(dataTervalidasi.kategori_id);
      if (!kategori) {
        filePerluDibersihkan = true;
        throw new AppError('Kategori tidak valid atau tidak ditemukan', 400);
      }

      // Cek duplikasi kode barang
      const barangAda = await BarangRepositori.getByKode(dataTervalidasi.kode_barang);
      if (barangAda) {
        filePerluDibersihkan = true;
        throw new AppError('Kode barang sudah digunakan', 409);
      }

      const dataSimpan: InputDataBarang = {
        ...dataTervalidasi,
        foto: pathFoto ?? null,
      };

      // Dari sini ke bawah, error berarti DB-level — file harus dihapus
      filePerluDibersihkan = true;
      const idBaru = await BarangRepositori.create(dataSimpan);
      // Jika berhasil simpan ke DB, file sudah "dimiliki" — tidak perlu dihapus
      filePerluDibersihkan = false;

      return await this.dapatkanBarangBerdasarkanId(idBaru);
    } catch (error) {
      // Bersihkan file yang terupload jika ada kegagalan dan ada file tersimpan
      if (filePerluDibersihkan && pathFoto) {
        await hapusFileAman(pathFoto);
      }
      throw error;
    }
  }

  /**
   * Memperbarui barang yang sudah ada.
   * 
   * Strategi Rollback Foto:
   * - Foto lama HANYA dihapus SETELAH update DB berhasil (bukan saat ada error).
   * - Foto baru yang gagal diproses AKAN dihapus dari disk (rollback).
   * - Foto lama TIDAK pernah dihapus jika update gagal (foto lama tetap valid).
   */
  async perbaruiBarang(id: number, data: unknown, pathFotoBaru?: string): Promise<DataBarang> {
    let fotoBaruPerluDibersihkan = !!pathFotoBaru; // File baru sudah tersimpan oleh Multer

    try {
      const barangLama = await this.dapatkanBarangBerdasarkanId(id);

      // Validasi input Zod
      const hasilValidasi = skemaBarang.safeParse(data);
      if (!hasilValidasi.success) {
        const pesanError = hasilValidasi.error.issues.map(err => err.message).join(', ');
        throw new AppError(pesanError, 400);
      }

      const dataTervalidasi = hasilValidasi.data;

      // Pastikan kategori valid
      const kategori = await KategoriRepositori.getById(dataTervalidasi.kategori_id);
      if (!kategori) {
        throw new AppError('Kategori tidak valid atau tidak ditemukan', 400);
      }

      // Cek duplikasi kode barang (mengecualikan ID barang ini)
      const barangAda = await BarangRepositori.getByKode(dataTervalidasi.kode_barang);
      if (barangAda && barangAda.id !== id) {
        throw new AppError('Kode barang sudah digunakan oleh barang lain', 409);
      }

      const dataUpdate: Partial<InputDataBarang> = {
        ...dataTervalidasi,
        // Hanya ganti foto jika ada file baru. undefined membuat COALESCE mempertahankan foto lama.
        ...(pathFotoBaru !== undefined ? { foto: pathFotoBaru } : {}),
      };

      await BarangRepositori.update(id, dataUpdate);

      // Update DB berhasil — foto baru sudah "dimiliki", tidak perlu dihapus
      fotoBaruPerluDibersihkan = false;

      // Hapus foto lama hanya jika update berhasil dan ada foto baru untuk menggantikannya
      if (pathFotoBaru && barangLama.foto) {
        await hapusFileAman(barangLama.foto);
      }

      return await this.dapatkanBarangBerdasarkanId(id);
    } catch (error) {
      // Rollback: hapus foto BARU jika ada error (foto lama tetap aman)
      if (fotoBaruPerluDibersihkan && pathFotoBaru) {
        await hapusFileAman(pathFotoBaru);
      }
      throw error;
    }
  }

  async hapusBarang(id: number): Promise<void> {
    const barang = await this.dapatkanBarangBerdasarkanId(id);

    await BarangRepositori.delete(id);

    // Hapus file fisik foto SETELAH record berhasil dihapus dari DB
    if (barang.foto) {
      await hapusFileAman(barang.foto);
    }
  }
}

export default new BarangLayanan();
