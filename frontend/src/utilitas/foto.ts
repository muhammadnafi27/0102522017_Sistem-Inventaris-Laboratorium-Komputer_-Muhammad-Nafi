const URL_UPLOAD = process.env.NEXT_PUBLIC_UPLOAD_URL ?? "http://localhost:3000/uploads";

// Membangun URL lengkap foto barang dari nama file yang tersimpan di database. Foto disajikan
// backend melalui /uploads/barang/<nama_file>. Mengembalikan null bila nama file kosong,
// supaya komponen foto bisa menampilkan fallback.
export function urlFotoBarang(namaFile: string | null | undefined): string | null {
  if (!namaFile) {
    return null;
  }
  return `${URL_UPLOAD}/barang/${namaFile}`;
}
