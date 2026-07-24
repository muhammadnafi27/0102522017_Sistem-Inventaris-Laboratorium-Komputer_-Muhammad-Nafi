import path from "node:path";

// Nama file foto default yang dipakai barang tanpa foto sendiri. File ini disediakan
// permanen di folder upload dan tidak boleh pernah dihapus oleh lifecycle foto barang.
export const NAMA_FOTO_DEFAULT = "default-barang.png";

// Folder fisik penyimpanan foto barang, relatif terhadap direktori kerja proses backend
// (selalu backend/ baik saat dev, build, maupun test) - konsisten dengan express.static("unggahan")
// pada aplikasi.ts.
export const FOLDER_UNGGAHAN_BARANG = path.join(process.cwd(), "unggahan", "barang");

// Whitelist MIME type foto yang diterima, dipetakan ke ekstensi file yang akan dipakai saat
// menyimpan. Ekstensi ditentukan dari MIME type hasil deteksi Multer, bukan dari nama file
// asli kiriman client, agar tidak bisa dipakai menyamarkan file berbahaya sebagai gambar.
export const EKSTENSI_PER_MIME: Readonly<Record<string, string>> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export const MIME_FOTO_DIIZINKAN = Object.keys(EKSTENSI_PER_MIME);
