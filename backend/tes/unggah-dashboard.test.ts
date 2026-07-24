import fs from "node:fs";
import path from "node:path";

import request from "supertest";

import { buatAplikasi } from "@/aplikasi";
import { tutupPoolDatabase } from "@/konfigurasi/database";
import { environment } from "@/konfigurasi/environment";
import { FOLDER_UNGGAHAN_BARANG, NAMA_FOTO_DEFAULT } from "@/konfigurasi/unggahan";

const aplikasi = buatAplikasi();

// PNG 1x1 piksel valid (sama dengan yang dipakai sebagai default-barang.png) - dipakai
// sebagai konten foto uji agar Multer benar-benar memproses file gambar sungguhan.
const PNG_VALID = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

async function ambilCookie(email: string, password: string): Promise<string> {
  const login = await request(aplikasi).post("/api/auth/login").send({ email, password });
  const cookie = login.headers["set-cookie"]?.[0];
  if (!cookie) {
    throw new Error(`Login gagal untuk ${email} saat menyiapkan pengujian.`);
  }
  return cookie;
}

function pathFisik(namaFile: string): string {
  return path.join(FOLDER_UNGGAHAN_BARANG, namaFile);
}

function fileAda(namaFile: string): boolean {
  return fs.existsSync(pathFisik(namaFile));
}

let cookieAdmin: string;
let kategoriId: number;

beforeAll(async () => {
  cookieAdmin = await ambilCookie("admin@uai.ac.id", "admin12345");
  const daftarKategori = await request(aplikasi).get("/api/kategori").set("Cookie", cookieAdmin);
  kategoriId = daftarKategori.body.data[0].id as number;
});

afterAll(async () => {
  await tutupPoolDatabase();
});

describe("Upload foto barang", () => {
  it("default-barang.png tersedia secara fisik di folder upload", () => {
    expect(fileAda(NAMA_FOTO_DEFAULT)).toBe(true);
  });

  it("create tanpa foto menggunakan fallback default-barang.png", async () => {
    const buat = await request(aplikasi)
      .post("/api/barang")
      .set("Cookie", cookieAdmin)
      .send({
        kode_barang: `UJI-FOTO-DEFAULT-${Date.now()}`,
        nama_barang: "Barang Tanpa Foto",
        kategori_id: kategoriId,
        kondisi: "Baik",
        lokasi: "Lab Uji",
        jumlah: 1,
      });

    expect(buat.status).toBe(201);
    expect(buat.body.data.foto).toBe(NAMA_FOTO_DEFAULT);
    const id = buat.body.data.id as number;

    await request(aplikasi).delete(`/api/barang/${id}`).set("Cookie", cookieAdmin);
    // default-barang.png tidak boleh pernah terhapus meski dipakai barang yang dihapus.
    expect(fileAda(NAMA_FOTO_DEFAULT)).toBe(true);
  });

  it("create dengan foto multipart menyimpan file fisik dengan nama unik acak", async () => {
    const buat = await request(aplikasi)
      .post("/api/barang")
      .set("Cookie", cookieAdmin)
      .field("kode_barang", `UJI-FOTO-${Date.now()}`)
      .field("nama_barang", "Barang Dengan Foto")
      .field("kategori_id", String(kategoriId))
      .field("kondisi", "Baik")
      .field("lokasi", "Lab Uji")
      .field("jumlah", "1")
      // originalname sengaja dibuat mencurigakan (path traversal) untuk membuktikan
      // nama file asli tidak pernah dipakai sebagai nama/path file di server.
      .attach("foto", PNG_VALID, { filename: "../../../../evil.png", contentType: "image/png" });

    expect(buat.status).toBe(201);
    const namaFoto = buat.body.data.foto as string;

    expect(namaFoto).not.toBe(NAMA_FOTO_DEFAULT);
    expect(namaFoto).not.toContain("..");
    expect(namaFoto).not.toContain("evil");
    expect(namaFoto).toMatch(/^barang-[0-9a-f]{32}\.png$/);
    expect(fileAda(namaFoto)).toBe(true);

    const id = buat.body.data.id as number;
    await request(aplikasi).delete(`/api/barang/${id}`).set("Cookie", cookieAdmin);
    // File non-default wajib ikut terhapus dari disk setelah barang dihapus.
    expect(fileAda(namaFoto)).toBe(false);
  });

  it("update mengganti foto: file lama dihapus, file baru tersimpan", async () => {
    const buat = await request(aplikasi)
      .post("/api/barang")
      .set("Cookie", cookieAdmin)
      .field("kode_barang", `UJI-GANTI-${Date.now()}`)
      .field("nama_barang", "Barang Ganti Foto")
      .field("kategori_id", String(kategoriId))
      .field("kondisi", "Baik")
      .field("lokasi", "Lab Uji")
      .field("jumlah", "1")
      .attach("foto", PNG_VALID, { filename: "awal.png", contentType: "image/png" });

    const id = buat.body.data.id as number;
    const fotoLama = buat.body.data.foto as string;
    expect(fileAda(fotoLama)).toBe(true);

    const perbarui = await request(aplikasi)
      .put(`/api/barang/${id}`)
      .set("Cookie", cookieAdmin)
      .field("kode_barang", buat.body.data.kode_barang)
      .field("nama_barang", "Barang Ganti Foto Diperbarui")
      .field("kategori_id", String(kategoriId))
      .field("kondisi", "Baik")
      .field("lokasi", "Lab Uji")
      .field("jumlah", "1")
      .attach("foto", PNG_VALID, { filename: "baru.png", contentType: "image/png" });

    expect(perbarui.status).toBe(200);
    const fotoBaru = perbarui.body.data.foto as string;

    expect(fotoBaru).not.toBe(fotoLama);
    expect(fileAda(fotoBaru)).toBe(true);
    // Foto lama baru boleh dihapus SETELAH update database sukses - di titik ini sudah harus hilang.
    expect(fileAda(fotoLama)).toBe(false);

    await request(aplikasi).delete(`/api/barang/${id}`).set("Cookie", cookieAdmin);
    expect(fileAda(fotoBaru)).toBe(false);
  });

  it("update tanpa mengirim foto baru mempertahankan foto lama", async () => {
    const buat = await request(aplikasi)
      .post("/api/barang")
      .set("Cookie", cookieAdmin)
      .field("kode_barang", `UJI-TETAP-${Date.now()}`)
      .field("nama_barang", "Barang Foto Tetap")
      .field("kategori_id", String(kategoriId))
      .field("kondisi", "Baik")
      .field("lokasi", "Lab Uji")
      .field("jumlah", "1")
      .attach("foto", PNG_VALID, { filename: "tetap.png", contentType: "image/png" });

    const id = buat.body.data.id as number;
    const foto = buat.body.data.foto as string;

    const perbarui = await request(aplikasi).put(`/api/barang/${id}`).set("Cookie", cookieAdmin).send({
      kode_barang: buat.body.data.kode_barang,
      nama_barang: "Barang Foto Tetap Diubah Namanya",
      kategori_id: kategoriId,
      kondisi: "Baik",
      lokasi: "Lab Uji",
      jumlah: 2,
    });

    expect(perbarui.status).toBe(200);
    expect(perbarui.body.data.foto).toBe(foto);
    expect(fileAda(foto)).toBe(true);

    await request(aplikasi).delete(`/api/barang/${id}`).set("Cookie", cookieAdmin);
  });

  it("menolak file PDF (bukan gambar) dengan 400 dan tidak menyimpan apa pun", async () => {
    const respons = await request(aplikasi)
      .post("/api/barang")
      .set("Cookie", cookieAdmin)
      .field("kode_barang", `UJI-PDF-${Date.now()}`)
      .field("nama_barang", "Percobaan Upload PDF")
      .field("kategori_id", String(kategoriId))
      .field("kondisi", "Baik")
      .field("lokasi", "Lab Uji")
      .field("jumlah", "1")
      .attach("foto", Buffer.from("%PDF-1.4 bukan gambar sungguhan"), {
        filename: "dokumen.pdf",
        contentType: "application/pdf",
      });

    expect(respons.status).toBe(400);
    expect(respons.body.sukses).toBe(false);
  });

  it("menolak file gambar yang melebihi batas ukuran dengan 413", async () => {
    const ukuranBerlebih = environment.uploadMaxMb * 1024 * 1024 + 1024;
    const bufferBesar = Buffer.alloc(ukuranBerlebih, 1);

    const respons = await request(aplikasi)
      .post("/api/barang")
      .set("Cookie", cookieAdmin)
      .field("kode_barang", `UJI-BESAR-${Date.now()}`)
      .field("nama_barang", "Percobaan Upload Besar")
      .field("kategori_id", String(kategoriId))
      .field("kondisi", "Baik")
      .field("lokasi", "Lab Uji")
      .field("jumlah", "1")
      .attach("foto", bufferBesar, { filename: "besar.png", contentType: "image/png" });

    expect(respons.status).toBe(413);
  });

  it("membersihkan file yang sudah terunggah bila validasi data lain gagal setelahnya", async () => {
    const jumlahFileSebelum = fs.readdirSync(FOLDER_UNGGAHAN_BARANG).length;

    const respons = await request(aplikasi)
      .post("/api/barang")
      .set("Cookie", cookieAdmin)
      .field("kode_barang", "PC-008") // kode duplikat seed - layanan akan menolak dengan 409
      .field("nama_barang", "Percobaan Kode Duplikat")
      .field("kategori_id", String(kategoriId))
      .field("kondisi", "Baik")
      .field("lokasi", "Lab Uji")
      .field("jumlah", "1")
      .attach("foto", PNG_VALID, { filename: "yatim.png", contentType: "image/png" });

    expect(respons.status).toBe(409);

    // Jumlah file di folder upload harus kembali seperti semula - file yang sempat
    // ditulis Multer sebelum layanan gagal wajib dibersihkan oleh controller.
    const jumlahFileSesudah = fs.readdirSync(FOLDER_UNGGAHAN_BARANG).length;
    expect(jumlahFileSesudah).toBe(jumlahFileSebelum);
  });
});

describe("GET /api/dashboard", () => {
  it("mengembalikan ringkasan dan berubah konsisten setelah mutasi data", async () => {
    const sebelum = await request(aplikasi).get("/api/dashboard").set("Cookie", cookieAdmin);
    expect(sebelum.status).toBe(200);
    expect(sebelum.body.data.distribusiKondisi).toHaveLength(4);
    expect(Array.isArray(sebelum.body.data.barangTerbaru)).toBe(true);
    expect(sebelum.body.data.barangTerbaru.length).toBeLessThanOrEqual(5);
    expect(Array.isArray(sebelum.body.data.daftarPerluPerhatian)).toBe(true);
    expect(sebelum.body.data.daftarPerluPerhatian.length).toBeLessThanOrEqual(5);

    const totalBarangSebelum = sebelum.body.data.totalBarang as number;
    const perluPerhatianSebelum = sebelum.body.data.perluPerhatian as number;

    const buat = await request(aplikasi).post("/api/barang").set("Cookie", cookieAdmin).send({
      kode_barang: `UJI-DASH-${Date.now()}`,
      nama_barang: "Barang Uji Dashboard",
      kategori_id: kategoriId,
      kondisi: "Rusak",
      lokasi: "Lab Uji",
      jumlah: 1,
    });
    const id = buat.body.data.id as number;

    const sesudah = await request(aplikasi).get("/api/dashboard").set("Cookie", cookieAdmin);
    expect(sesudah.body.data.totalBarang).toBe(totalBarangSebelum + 1);
    expect(sesudah.body.data.perluPerhatian).toBe(perluPerhatianSebelum + 1);
    expect(
      sesudah.body.data.barangTerbaru.some((b: { id: number }) => b.id === id),
    ).toBe(true);
    expect(
      sesudah.body.data.daftarPerluPerhatian.some((b: { id: number }) => b.id === id),
    ).toBe(true);

    await request(aplikasi).delete(`/api/barang/${id}`).set("Cookie", cookieAdmin);

    const kembali = await request(aplikasi).get("/api/dashboard").set("Cookie", cookieAdmin);
    expect(kembali.body.data.totalBarang).toBe(totalBarangSebelum);
    expect(kembali.body.data.perluPerhatian).toBe(perluPerhatianSebelum);
  });

  it("dapat diakses viewer (bukan hanya admin/operator)", async () => {
    const cookieViewer = await ambilCookie("nafiazka2003@gmail.com", "Nafi12345");
    const respons = await request(aplikasi).get("/api/dashboard").set("Cookie", cookieViewer);
    expect(respons.status).toBe(200);
  });
});
