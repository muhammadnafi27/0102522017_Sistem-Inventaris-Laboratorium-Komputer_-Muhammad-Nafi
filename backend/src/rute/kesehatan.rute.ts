import { Router, Request, Response } from 'express';
import pool from '../konfigurasi/database';

// Membuat router khusus untuk endpoint kesehatan
const ruteKesehatan = Router();

// GET /api/kesehatan - Memeriksa status server dan database
ruteKesehatan.get('/kesehatan', async (req: Request, res: Response) => {
  try {
    // Mencoba melakukan query sederhana ke database
    await pool.query('SELECT 1');
    
    res.status(200).json({
      sukses: true,
      pesan: "Server dan koneksi database berjalan dengan baik"
    });
  } catch (error) {
    res.status(500).json({
      sukses: false,
      pesan: "Server berjalan, tetapi koneksi database gagal"
    });
  }
});

export default ruteKesehatan;
