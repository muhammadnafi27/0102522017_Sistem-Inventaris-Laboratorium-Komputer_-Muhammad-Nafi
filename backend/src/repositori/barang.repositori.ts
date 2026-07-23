import pool from '../konfigurasi/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface DataBarang extends RowDataPacket {
  id: number;
  kode_barang: string;
  nama_barang: string;
  kategori_id: number;
  nama_kategori?: string;  // Hasil JOIN — tersedia di getAll() dan getById()
  kondisi: string;
  lokasi: string;
  jumlah: number;
  foto: string | null;
  created_at: Date;
  updated_at: Date;
}

/** Tipe untuk input INSERT — dipisah dari RowDataPacket agar tidak ada konflik tipe */
export interface InputDataBarang {
  kode_barang: string;
  nama_barang: string;
  kategori_id: number;
  kondisi: string;
  lokasi: string;
  jumlah: number;
  foto?: string | null;
}

export interface ParameterPencarianBarang {
  cari?: string;
  kategori_id?: number;
  kondisi?: string;
  halaman?: number;
  batas?: number;
  urut?: string;
  arah?: 'asc' | 'desc';
}

export interface HasilPaginasi<T> {
  data: T[];
  meta: {
    total_data: number;
    total_halaman: number;
    halaman_sekarang: number;
    batas: number;
  };
}

/** Kolom yang diizinkan untuk pengurutan (whitelist) */
const KOLOM_URUT_DIIZINKAN = new Set([
  'kode_barang', 'nama_barang', 'kategori_id', 'kondisi', 'jumlah', 'created_at'
]);

/** Batas maksimum item per halaman */
const BATAS_MAKSIMUM = 100;

/** Batas default item per halaman */
const BATAS_DEFAULT = 10;

class BarangRepositori {
  /**
   * Mengambil semua barang dengan dukungan filter, pencarian teks, pengurutan, dan paginasi.
   * Menggunakan dua Prepared Statement terpisah: satu untuk COUNT dan satu untuk data.
   */
  async getAll(params: ParameterPencarianBarang): Promise<HasilPaginasi<DataBarang>> {
    // Normalisasi parameter agar selalu valid
    const batas = (params.batas && params.batas > 0 && params.batas <= BATAS_MAKSIMUM)
      ? params.batas
      : BATAS_DEFAULT;
    const halaman = (params.halaman && params.halaman > 0) ? params.halaman : 1;
    const offset = (halaman - 1) * batas;

    // Build kondisi WHERE secara dinamis — nilai selalu melalui prepared statement (?)
    const kondisiWhere: string[] = [];
    const nilaiFilter: (string | number)[] = [];

    if (params.cari?.trim()) {
      kondisiWhere.push('(b.kode_barang LIKE ? OR b.nama_barang LIKE ?)');
      const kataCari = `%${params.cari.trim()}%`;
      nilaiFilter.push(kataCari, kataCari);
    }

    if (params.kategori_id && params.kategori_id > 0) {
      kondisiWhere.push('b.kategori_id = ?');
      nilaiFilter.push(params.kategori_id);
    }

    if (params.kondisi?.trim()) {
      kondisiWhere.push('b.kondisi = ?');
      nilaiFilter.push(params.kondisi.trim());
    }

    const whereClause = kondisiWhere.length > 0 ? `WHERE ${kondisiWhere.join(' AND ')}` : '';

    // Pengurutan melalui whitelist — TIDAK menggunakan interpolasi string dari input user
    const kolomUrut = (params.urut && KOLOM_URUT_DIIZINKAN.has(params.urut))
      ? `b.${params.urut}`
      : 'b.created_at';
    const arahUrut = params.arah === 'asc' ? 'ASC' : 'DESC';

    // Query 1: Hitung total data untuk meta paginasi
    const queryHitung = `
      SELECT COUNT(*) AS total
      FROM barang b
      ${whereClause}
    `;
    const [hasilHitung] = await pool.query<RowDataPacket[]>(queryHitung, nilaiFilter);
    const totalData = Number(hasilHitung[0].total);

    // Query 2: Ambil data halaman ini dengan JOIN kategori untuk nama_kategori (anti N+1)
    const queryData = `
      SELECT b.id, b.kode_barang, b.nama_barang, b.kategori_id,
             k.nama_kategori, b.kondisi, b.lokasi, b.jumlah, b.foto,
             b.created_at, b.updated_at
      FROM barang b
      JOIN kategori_barang k ON b.kategori_id = k.id
      ${whereClause}
      ORDER BY ${kolomUrut} ${arahUrut}
      LIMIT ? OFFSET ?
    `;
    const nilaiParamsData: (string | number)[] = [...nilaiFilter, batas, offset];
    const [rows] = await pool.query<DataBarang[]>(queryData, nilaiParamsData);

    return {
      data: rows,
      meta: {
        total_data: totalData,
        total_halaman: Math.ceil(totalData / batas),
        halaman_sekarang: halaman,
        batas,
      },
    };
  }

  /**
   * Mengambil satu barang beserta nama kategori. Mengembalikan null jika tidak ditemukan.
   */
  async getById(id: number): Promise<DataBarang | null> {
    const query = `
      SELECT b.id, b.kode_barang, b.nama_barang, b.kategori_id,
             k.nama_kategori, b.kondisi, b.lokasi, b.jumlah, b.foto,
             b.created_at, b.updated_at
      FROM barang b
      JOIN kategori_barang k ON b.kategori_id = k.id
      WHERE b.id = ?
    `;
    const [rows] = await pool.query<DataBarang[]>(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Mengambil satu barang berdasarkan kode_barang untuk pengecekan keunikan.
   */
  async getByKode(kodeBarang: string): Promise<DataBarang | null> {
    const query = `SELECT * FROM barang WHERE kode_barang = ?`;
    const [rows] = await pool.query<DataBarang[]>(query, [kodeBarang]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Menyimpan barang baru. Mengembalikan ID yang baru dibuat.
   */
  async create(data: InputDataBarang): Promise<number> {
    const query = `
      INSERT INTO barang (kode_barang, nama_barang, kategori_id, kondisi, lokasi, jumlah, foto)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query<ResultSetHeader>(query, [
      data.kode_barang,
      data.nama_barang,
      data.kategori_id,
      data.kondisi,
      data.lokasi,
      data.jumlah,
      data.foto ?? null,
    ]);
    return result.insertId;
  }

  /**
   * Memperbarui data barang. COALESCE mempertahankan nilai lama jika kolom tidak dikirim (undefined/null).
   * Khusus foto: null disimpan apa adanya (artinya hapus foto), undefined berarti tidak mengubah.
   */
  async update(id: number, data: Partial<InputDataBarang>): Promise<boolean> {
    const query = `
      UPDATE barang
      SET kode_barang = COALESCE(?, kode_barang),
          nama_barang = COALESCE(?, nama_barang),
          kategori_id = COALESCE(?, kategori_id),
          kondisi     = COALESCE(?, kondisi),
          lokasi      = COALESCE(?, lokasi),
          jumlah      = COALESCE(?, jumlah),
          foto        = COALESCE(?, foto)
      WHERE id = ?
    `;
    const [result] = await pool.query<ResultSetHeader>(query, [
      data.kode_barang   ?? null,
      data.nama_barang   ?? null,
      data.kategori_id   ?? null,
      data.kondisi       ?? null,
      data.lokasi        ?? null,
      data.jumlah        ?? null,
      data.foto !== undefined ? data.foto : null, // null = hapus foto; undefined = pertahankan
      id,
    ]);
    return result.affectedRows > 0;
  }

  /**
   * Menghapus barang berdasarkan ID. Mengembalikan true jika berhasil.
   */
  async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM barang WHERE id = ?`;
    const [result] = await pool.query<ResultSetHeader>(query, [id]);
    return result.affectedRows > 0;
  }
}

export default new BarangRepositori();
