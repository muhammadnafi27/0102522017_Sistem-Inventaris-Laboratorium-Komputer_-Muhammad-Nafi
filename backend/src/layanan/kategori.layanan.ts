import KategoriRepositori, { KategoriBarang } from '../repositori/kategori.repositori';
import { AppError } from '../utilitas/AppError';
import { skemaKategori } from '../validasi/kategori.validasi';

class KategoriLayanan {
  async dapatkanSemuaKategori(): Promise<KategoriBarang[]> {
    return await KategoriRepositori.getAll();
  }

  async dapatkanKategoriBerdasarkanId(id: number): Promise<KategoriBarang> {
    const kategori = await KategoriRepositori.getById(id);
    if (!kategori) {
      throw new AppError('Kategori tidak ditemukan', 404);
    }
    return kategori;
  }

  async buatKategori(data: unknown): Promise<KategoriBarang> {
    // Validasi input Zod
    const hasilValidasi = skemaKategori.safeParse(data);
    if (!hasilValidasi.success) {
      const pesanError = hasilValidasi.error.issues.map(err => err.message).join(', ');
      throw new AppError(pesanError, 400);
    }

    const { nama_kategori } = hasilValidasi.data;

    // Cek keunikan (case-insensitive)
    const kategoriAda = await KategoriRepositori.getByNama(nama_kategori);
    if (kategoriAda) {
      throw new AppError('Nama kategori sudah digunakan', 409);
    }

    const idBaru = await KategoriRepositori.create(nama_kategori);
    return await this.dapatkanKategoriBerdasarkanId(idBaru);
  }

  async perbaruiKategori(id: number, data: unknown): Promise<KategoriBarang> {
    // Pastikan kategori ada
    await this.dapatkanKategoriBerdasarkanId(id);

    // Validasi input Zod
    const hasilValidasi = skemaKategori.safeParse(data);
    if (!hasilValidasi.success) {
      const pesanError = hasilValidasi.error.issues.map(err => err.message).join(', ');
      throw new AppError(pesanError, 400);
    }

    const { nama_kategori } = hasilValidasi.data;

    // Cek keunikan (case-insensitive) dengan mengecualikan ID saat ini
    const kategoriAda = await KategoriRepositori.getByNama(nama_kategori);
    if (kategoriAda && kategoriAda.id !== id) {
      throw new AppError('Nama kategori sudah digunakan oleh kategori lain', 409);
    }

    await KategoriRepositori.update(id, nama_kategori);
    return await this.dapatkanKategoriBerdasarkanId(id);
  }

  async hapusKategori(id: number): Promise<void> {
    // Pastikan kategori ada
    await this.dapatkanKategoriBerdasarkanId(id);

    try {
      await KategoriRepositori.delete(id);
    } catch (error: any) {
      // Tangani error foreign key (ER_ROW_IS_REFERENCED_2) MySQL
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        throw new AppError('Kategori tidak dapat dihapus karena masih memiliki barang terkait.', 409);
      }
      throw error; // Lempar ke global handler jika bukan error constraint
    }
  }
}

export default new KategoriLayanan();
