// Mengambil URL API dari environment atau menggunakan default
const URL_API = process.env.NEXT_PUBLIC_URL_API || 'http://localhost:3000/api';

/**
 * Memanggil endpoint kesehatan backend untuk mengecek status server dan database.
 */
export const cekKesehatan = async () => {
  try {
    const res = await fetch(`${URL_API}/kesehatan`, {
      cache: 'no-store' // Memastikan tidak ada cache agar selalu mendapat status terbaru
    });
    const data = await res.json();
    return data;
  } catch {
    return {
      sukses: false,
      pesan: "Gagal terhubung ke server backend"
    };
  }
}
