import pool from '../konfigurasi/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface KategoriBarang extends RowDataPacket {
  id: number;
  nama_kategori: string;
  created_at: Date;
  updated_at: Date;
  jumlah_barang?: number; // Opsional, hasil join
}

class KategoriRepositori {
  /**
   * Mengambil semua kategori beserta jumlah barang yang terhubung ke kategori tersebut.
   */
  async getAll(): Promise<KategoriBarang[]> {
    const query = `
      SELECT k.*, COUNT(b.id) AS jumlah_barang
      FROM kategori_barang k
      LEFT JOIN barang b ON k.id = b.kategori_id
      GROUP BY k.id
      ORDER BY k.nama_kategori ASC
    `;
    const [rows] = await pool.query<KategoriBarang[]>(query);
    return rows;
  }

  /**
   * Mengambil satu kategori berdasarkan ID.
   */
  async getById(id: number): Promise<KategoriBarang | null> {
    const query = `SELECT * FROM kategori_barang WHERE id = ?`;
    const [rows] = await pool.query<KategoriBarang[]>(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Mengambil satu kategori berdasarkan nama (case-insensitive) untuk pengecekan unik.
   */
  async getByNama(namaKategori: string): Promise<KategoriBarang | null> {
    const query = `SELECT * FROM kategori_barang WHERE LOWER(nama_kategori) = LOWER(?)`;
    const [rows] = await pool.query<KategoriBarang[]>(query, [namaKategori]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Menyimpan kategori baru.
   */
  async create(namaKategori: string): Promise<number> {
    const query = `INSERT INTO kategori_barang (nama_kategori) VALUES (?)`;
    const [result] = await pool.query<ResultSetHeader>(query, [namaKategori]);
    return result.insertId;
  }

  /**
   * Memperbarui kategori yang ada.
   */
  async update(id: number, namaKategori: string): Promise<boolean> {
    const query = `UPDATE kategori_barang SET nama_kategori = ? WHERE id = ?`;
    const [result] = await pool.query<ResultSetHeader>(query, [namaKategori, id]);
    return result.affectedRows > 0;
  }

  /**
   * Menghapus kategori.
   * Jika gagal karena foreign key constraint, driver mysql2 akan melempar error.
   */
  async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM kategori_barang WHERE id = ?`;
    const [result] = await pool.query<ResultSetHeader>(query, [id]);
    return result.affectedRows > 0;
  }
}

export default new KategoriRepositori();
