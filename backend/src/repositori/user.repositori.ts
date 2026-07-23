import mysql, { RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import pool from '../konfigurasi/database';

// Mendefinisikan bentuk baris user dari database secara eksplisit
export interface UserDB extends RowDataPacket {
  id: number;
  nama: string;
  email: string;
  password?: string;
  role: 'admin' | 'operator' | 'viewer';
}

/**
 * Mencari pengguna berdasarkan email untuk proses otentikasi.
 * Mengembalikan password hash untuk proses verifikasi login.
 */
export const cariUserBerdasarkanEmail = async (email: string): Promise<UserDB | null> => {
  const sql = 'SELECT id, nama, email, password, role FROM users WHERE email = ? LIMIT 1';
  const [baris] = await pool.execute<UserDB[]>(sql, [email]);
  return baris[0] ?? null;
};

/**
 * Mencari pengguna berdasarkan ID (tanpa mengambil kolom password).
 */
export const cariUserBerdasarkanId = async (id: number): Promise<UserDB | null> => {
  const sql = 'SELECT id, nama, email, role FROM users WHERE id = ? LIMIT 1';
  const [baris] = await pool.execute<UserDB[]>(sql, [id]);
  return baris[0] ?? null;
};

/**
 * Mendaftarkan pengguna baru dengan role 'viewer'.
 * @returns insertId dari baris yang baru dibuat
 */
export const buatUserViewer = async (nama: string, email: string, passwordHash: string): Promise<number> => {
  const sql = 'INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)';
  const [hasil] = await pool.execute<ResultSetHeader>(sql, [nama, email, passwordHash, 'viewer']);
  return hasil.insertId;
};

// Tipe mysql tidak dipakai secara langsung; diimpor untuk konsistensi modul
void mysql;
