import mysql, { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import pool from '../konfigurasi/database';

export interface UserDB extends RowDataPacket {
  id: number;
  nama: string;
  email: string;
  password?: string;
  role: 'admin' | 'operator' | 'viewer';
  created_at?: Date;
  updated_at?: Date;
}

export interface UserPublic {
  id: number;
  nama: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
  created_at?: Date;
  updated_at?: Date;
}

export interface ParameterPencarianUser {
  cari?: string;
  role?: 'admin' | 'operator' | 'viewer';
  halaman?: number;
  batas?: number;
  urut?: string;
  arah?: 'asc' | 'desc';
}

export interface HasilPaginasiUser {
  data: UserPublic[];
  meta: {
    total_data: number;
    total_halaman: number;
    halaman_sekarang: number;
    batas: number;
  };
}

const KOLOM_URUT_DIIZINKAN = new Set(['nama', 'email', 'role', 'created_at']);
const BATAS_MAKSIMUM = 100;
const BATAS_DEFAULT = 10;

/**
 * Mencari pengguna berdasarkan email untuk proses otentikasi.
 * Mengembalikan password hash untuk verifikasi login.
 */
export const cariUserBerdasarkanEmail = async (email: string): Promise<UserDB | null> => {
  const sql = 'SELECT id, nama, email, password, role FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1';
  const [baris] = await pool.execute<UserDB[]>(sql, [email.toLowerCase()]);
  return baris[0] ?? null;
};

/**
 * Mencari pengguna berdasarkan ID (tanpa password/reset_token).
 */
export const cariUserBerdasarkanId = async (id: number): Promise<UserDB | null> => {
  const sql = 'SELECT id, nama, email, role, created_at, updated_at FROM users WHERE id = ? LIMIT 1';
  const [baris] = await pool.execute<UserDB[]>(sql, [id]);
  return baris[0] ?? null;
};

/**
 * Mendaftarkan pengguna baru publik dengan role 'viewer'.
 */
export const buatUserViewer = async (nama: string, email: string, passwordHash: string): Promise<number> => {
  const sql = 'INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)';
  const [hasil] = await pool.execute<ResultSetHeader>(sql, [nama, email.toLowerCase(), passwordHash, 'viewer']);
  return hasil.insertId;
};

/**
 * Mengambil daftar user dengan pencarian, filter role, paginasi, dan pengurutan (khusus admin).
 */
export const dapatkanSemuaUser = async (params: ParameterPencarianUser): Promise<HasilPaginasiUser> => {
  const batas = (params.batas && params.batas > 0 && params.batas <= BATAS_MAKSIMUM)
    ? params.batas
    : BATAS_DEFAULT;
  const halaman = (params.halaman && params.halaman > 0) ? params.halaman : 1;
  const offset = (halaman - 1) * batas;

  const kondisiWhere: string[] = [];
  const nilaiFilter: (string | number)[] = [];

  if (params.cari?.trim()) {
    kondisiWhere.push('(nama LIKE ? OR email LIKE ?)');
    const kataCari = `%${params.cari.trim().toLowerCase()}%`;
    nilaiFilter.push(kataCari, kataCari);
  }

  if (params.role) {
    kondisiWhere.push('role = ?');
    nilaiFilter.push(params.role);
  }

  const whereClause = kondisiWhere.length > 0 ? `WHERE ${kondisiWhere.join(' AND ')}` : '';

  const kolomUrut = (params.urut && KOLOM_URUT_DIIZINKAN.has(params.urut))
    ? params.urut
    : 'created_at';
  const arahUrut = params.arah === 'asc' ? 'ASC' : 'DESC';

  // Query 1: Hitung total
  const queryHitung = `SELECT COUNT(*) AS total FROM users ${whereClause}`;
  const [hasilHitung] = await pool.query<RowDataPacket[]>(queryHitung, nilaiFilter);
  const totalData = Number(hasilHitung[0].total);

  // Query 2: Data halaman (TANPA kolom password & reset_token)
  const queryData = `
    SELECT id, nama, email, role, created_at, updated_at
    FROM users
    ${whereClause}
    ORDER BY ${kolomUrut} ${arahUrut}
    LIMIT ? OFFSET ?
  `;
  const nilaiParamsData: (string | number)[] = [...nilaiFilter, batas, offset];
  const [rows] = await pool.query<UserDB[]>(queryData, nilaiParamsData);

  return {
    data: rows.map(u => ({
      id: u.id,
      nama: u.nama,
      email: u.email,
      role: u.role,
      created_at: u.created_at,
      updated_at: u.updated_at,
    })),
    meta: {
      total_data: totalData,
      total_halaman: Math.ceil(totalData / batas),
      halaman_sekarang: halaman,
      batas,
    },
  };
};

/**
 * Membuat user baru oleh Admin dengan role kustom.
 */
export const buatUserOlehAdmin = async (
  nama: string,
  email: string,
  passwordHash: string,
  role: 'admin' | 'operator' | 'viewer'
): Promise<number> => {
  const sql = 'INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)';
  const [hasil] = await pool.execute<ResultSetHeader>(sql, [nama, email.toLowerCase(), passwordHash, role]);
  return hasil.insertId;
};

/**
 * Memperbarui nama, email, dan role user.
 */
export const perbaruiUserByAdmin = async (
  id: number,
  nama: string,
  email: string,
  role: 'admin' | 'operator' | 'viewer'
): Promise<boolean> => {
  const sql = 'UPDATE users SET nama = ?, email = ?, role = ? WHERE id = ?';
  const [hasil] = await pool.execute<ResultSetHeader>(sql, [nama, email.toLowerCase(), role, id]);
  return hasil.affectedRows > 0;
};

/**
 * Memperbarui password user (misal saat reset password).
 */
export const perbaruiPasswordUser = async (id: number, passwordHash: string): Promise<boolean> => {
  const sql = 'UPDATE users SET password = ? WHERE id = ?';
  const [hasil] = await pool.execute<ResultSetHeader>(sql, [passwordHash, id]);
  return hasil.affectedRows > 0;
};

/**
 * Menghapus user berdasarkan ID.
 */
export const hapusUserById = async (id: number): Promise<boolean> => {
  const sql = 'DELETE FROM users WHERE id = ?';
  const [hasil] = await pool.execute<ResultSetHeader>(sql, [id]);
  return hasil.affectedRows > 0;
};

/**
 * Menghitung jumlah total pengguna dengan role 'admin'.
 * Sangat penting untuk proteksi larangan menghapus/mengubah admin terakhir.
 */
export const hitungJumlahAdmin = async (): Promise<number> => {
  const sql = "SELECT COUNT(*) AS total FROM users WHERE role = 'admin'";
  const [baris] = await pool.execute<RowDataPacket[]>(sql);
  return Number(baris[0].total);
};

void mysql;
