// Konfigurasi dan inisialisasi pool koneksi database MySQL menggunakan mysql2/promise
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Memuat variabel environment dari .env
dotenv.config();

// Membuat pool koneksi untuk digunakan secara global oleh repositori
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'inventaris_laboratorium',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
