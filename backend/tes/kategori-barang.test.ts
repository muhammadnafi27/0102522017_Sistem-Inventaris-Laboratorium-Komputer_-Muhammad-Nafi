import request from "supertest";

import { buatAplikasi } from "@/aplikasi";
import { tutupPoolDatabase } from "@/konfigurasi/database";

const aplikasi = buatAplikasi();

async function ambilCookie(email: string, password: string): Promise<string> {
  const login = await request(aplikasi).post("/api/auth/login").send({ email, password });
  const cookie = login.headers["set-cookie"]?.[0];
  if (!cookie) {
    throw new Error(`Login gagal untuk ${email} saat menyiapkan pengujian.`);
  }
  return cookie;
}

let cookieAdmin: string;
let cookieOperator: string;
let cookieViewer: string;

beforeAll(async () => {
  cookieAdmin = await ambilCookie("admin@uai.ac.id", "admin12345");
  cookieOperator = await ambilCookie("staff@uai.ac.id", "staff12345");
  cookieViewer = await ambilCookie("nafiazka2003@gmail.com", "Nafi12345");
});

afterAll(async () => {
  await tutupPoolDatabase();
});

describe("Kategori - CRUD dan role", () => {
  it("admin dapat melakukan siklus lengkap create->update->delete", async () => {
    const nama = `Kategori Uji ${Date.now()}`;

    const buat = await request(aplikasi)
      .post("/api/kategori")
      .set("Cookie", cookieAdmin)
      .send({ nama_kategori: nama, deskripsi: "Dibuat oleh pengujian otomatis." });
    expect(buat.status).toBe(201);
    expect(buat.body.data.nama_kategori).toBe(nama);
    const id = buat.body.data.id as number;

    const perbarui = await request(aplikasi)
      .put(`/api/kategori/${id}`)
      .set("Cookie", cookieAdmin)
      .send({ nama_kategori: `${nama} Diubah`, deskripsi: "Deskripsi diperbarui." });
    expect(perbarui.status).toBe(200);
    expect(perbarui.body.data.nama_kategori).toBe(`${nama} Diubah`);

    const hapus = await request(aplikasi).delete(`/api/kategori/${id}`).set("Cookie", cookieAdmin);
    expect(hapus.status).toBe(200);
  });

  it("menolak nama kategori duplikat dengan 409", async () => {
    const respons = await request(aplikasi)
      .post("/api/kategori")
      .set("Cookie", cookieAdmin)
      .send({ nama_kategori: "Komputer" });

    expect(respons.status).toBe(409);
    expect(respons.body.kesalahan?.[0]?.field).toBe("nama_kategori");
  });

  it("menolak penghapusan kategori yang masih dipakai barang dengan 409", async () => {
    const daftar = await request(aplikasi).get("/api/kategori").set("Cookie", cookieAdmin);
    const kategoriDipakai = daftar.body.data.find(
      (k: { jumlah_barang: number }) => k.jumlah_barang > 0,
    );
    expect(kategoriDipakai).toBeDefined();

    const hapus = await request(aplikasi)
      .delete(`/api/kategori/${kategoriDipakai.id}`)
      .set("Cookie", cookieAdmin);

    expect(hapus.status).toBe(409);
  });

  it("operator dapat create/update tetapi ditolak 403 saat delete", async () => {
    const nama = `Kategori Operator ${Date.now()}`;
    const buat = await request(aplikasi)
      .post("/api/kategori")
      .set("Cookie", cookieOperator)
      .send({ nama_kategori: nama });
    expect(buat.status).toBe(201);
    const id = buat.body.data.id as number;

    const hapus = await request(aplikasi).delete(`/api/kategori/${id}`).set("Cookie", cookieOperator);
    expect(hapus.status).toBe(403);

    // Bersihkan data uji memakai admin karena operator tidak diizinkan menghapus.
    await request(aplikasi).delete(`/api/kategori/${id}`).set("Cookie", cookieAdmin);
  });

  it("viewer ditolak 403 pada seluruh akses menu kategori (termasuk GET)", async () => {
    const daftar = await request(aplikasi).get("/api/kategori").set("Cookie", cookieViewer);
    expect(daftar.status).toBe(403);

    const buat = await request(aplikasi)
      .post("/api/kategori")
      .set("Cookie", cookieViewer)
      .send({ nama_kategori: "Kategori Viewer" });
    expect(buat.status).toBe(403);
  });
});

describe("Barang - CRUD dan role", () => {
  let kategoriId: number;

  beforeAll(async () => {
    const daftar = await request(aplikasi).get("/api/kategori").set("Cookie", cookieAdmin);
    kategoriId = daftar.body.data[0].id as number;
  });

  it("admin dapat melakukan siklus lengkap create->read->update->delete", async () => {
    const kode = `UJI-${Date.now()}`;

    const buat = await request(aplikasi).post("/api/barang").set("Cookie", cookieAdmin).send({
      kode_barang: kode.toLowerCase(),
      nama_barang: "Barang Uji Otomatis",
      kategori_id: kategoriId,
      kondisi: "Baik",
      lokasi: "Lab Uji",
      jumlah: 5,
    });
    expect(buat.status).toBe(201);
    // kode_barang wajib dinormalisasi uppercase meski dikirim lowercase.
    expect(buat.body.data.kode_barang).toBe(kode.toUpperCase());
    expect(buat.body.data.nama_kategori).toBeDefined();
    const id = buat.body.data.id as number;

    const detail = await request(aplikasi).get(`/api/barang/${id}`).set("Cookie", cookieViewer);
    expect(detail.status).toBe(200);
    expect(detail.body.data.nama_barang).toBe("Barang Uji Otomatis");

    const perbarui = await request(aplikasi)
      .put(`/api/barang/${id}`)
      .set("Cookie", cookieOperator)
      .send({
        kode_barang: kode,
        nama_barang: "Barang Uji Diperbarui",
        kategori_id: kategoriId,
        kondisi: "Perlu Perawatan",
        lokasi: "Lab Uji 2",
        jumlah: 8,
      });
    expect(perbarui.status).toBe(200);
    expect(perbarui.body.data.kondisi).toBe("Perlu Perawatan");

    const hapus = await request(aplikasi).delete(`/api/barang/${id}`).set("Cookie", cookieAdmin);
    expect(hapus.status).toBe(200);

    const setelahHapus = await request(aplikasi).get(`/api/barang/${id}`).set("Cookie", cookieAdmin);
    expect(setelahHapus.status).toBe(404);
  });

  it("menolak kode_barang duplikat dengan 409", async () => {
    const respons = await request(aplikasi).post("/api/barang").set("Cookie", cookieAdmin).send({
      kode_barang: "PC-008",
      nama_barang: "Duplikat Kode",
      kategori_id: kategoriId,
      kondisi: "Baik",
      lokasi: "Lab Uji",
      jumlah: 1,
    });

    expect(respons.status).toBe(409);
    expect(respons.body.kesalahan?.[0]?.field).toBe("kode_barang");
  });

  it("menolak kategori_id yang tidak ada dengan 422", async () => {
    const respons = await request(aplikasi).post("/api/barang").set("Cookie", cookieAdmin).send({
      kode_barang: `UJI-422-${Date.now()}`,
      nama_barang: "Kategori Tidak Ada",
      kategori_id: 999999,
      kondisi: "Baik",
      lokasi: "Lab Uji",
      jumlah: 1,
    });

    expect(respons.status).toBe(422);
    expect(respons.body.kesalahan?.[0]?.field).toBe("kategori_id");
  });

  it("mengembalikan 404 yang konsisten untuk barang yang tidak ada (get/put/delete)", async () => {
    const idTidakAda = 999999;

    const detail = await request(aplikasi).get(`/api/barang/${idTidakAda}`).set("Cookie", cookieAdmin);
    expect(detail.status).toBe(404);

    const perbarui = await request(aplikasi)
      .put(`/api/barang/${idTidakAda}`)
      .set("Cookie", cookieAdmin)
      .send({
        kode_barang: "TIDAK-ADA",
        nama_barang: "Tidak Ada",
        kategori_id: kategoriId,
        kondisi: "Baik",
        lokasi: "Lab Uji",
        jumlah: 1,
      });
    expect(perbarui.status).toBe(404);

    const hapus = await request(aplikasi).delete(`/api/barang/${idTidakAda}`).set("Cookie", cookieAdmin);
    expect(hapus.status).toBe(404);
  });

  describe("Pembatasan role pada aksi tulis", () => {
    let idTarget: number;

    beforeAll(async () => {
      const buat = await request(aplikasi).post("/api/barang").set("Cookie", cookieAdmin).send({
        kode_barang: `UJI-ROLE-${Date.now()}`,
        nama_barang: "Barang Target Uji Role",
        kategori_id: kategoriId,
        kondisi: "Baik",
        lokasi: "Lab Uji",
        jumlah: 1,
      });
      idTarget = buat.body.data.id as number;
    });

    afterAll(async () => {
      await request(aplikasi).delete(`/api/barang/${idTarget}`).set("Cookie", cookieAdmin);
    });

    it("operator ditolak 403 saat delete barang", async () => {
      const respons = await request(aplikasi)
        .delete(`/api/barang/${idTarget}`)
        .set("Cookie", cookieOperator);
      expect(respons.status).toBe(403);
    });

    it("viewer ditolak 403 pada create/update/delete barang", async () => {
      const buat = await request(aplikasi).post("/api/barang").set("Cookie", cookieViewer).send({
        kode_barang: `UJI-VIEWER-${Date.now()}`,
        nama_barang: "Percobaan Viewer",
        kategori_id: kategoriId,
        kondisi: "Baik",
        lokasi: "Lab Uji",
        jumlah: 1,
      });
      expect(buat.status).toBe(403);

      const perbarui = await request(aplikasi)
        .put(`/api/barang/${idTarget}`)
        .set("Cookie", cookieViewer)
        .send({
          kode_barang: "TIDAK-BERUBAH",
          nama_barang: "Tidak Berubah",
          kategori_id: kategoriId,
          kondisi: "Baik",
          lokasi: "Lab Uji",
          jumlah: 1,
        });
      expect(perbarui.status).toBe(403);

      const hapus = await request(aplikasi)
        .delete(`/api/barang/${idTarget}`)
        .set("Cookie", cookieViewer);
      expect(hapus.status).toBe(403);
    });

    it("viewer tetap dapat membaca daftar dan detail barang", async () => {
      const daftar = await request(aplikasi).get("/api/barang").set("Cookie", cookieViewer);
      expect(daftar.status).toBe(200);

      const detail = await request(aplikasi)
        .get(`/api/barang/${idTarget}`)
        .set("Cookie", cookieViewer);
      expect(detail.status).toBe(200);
    });
  });

  describe("Search, filter, dan pagination", () => {
    it("kombinasi kategori_id + kondisi menghasilkan total & meta pagination yang benar", async () => {
      const daftarKategori = await request(aplikasi).get("/api/kategori").set("Cookie", cookieAdmin);
      const kategoriKomputer = daftarKategori.body.data.find(
        (k: { nama_kategori: string }) => k.nama_kategori === "Komputer",
      );
      expect(kategoriKomputer).toBeDefined();

      const respons = await request(aplikasi)
        .get("/api/barang")
        .query({ kategori_id: kategoriKomputer.id, kondisi: "Baik", limit: 10, page: 1 })
        .set("Cookie", cookieViewer);

      expect(respons.status).toBe(200);
      expect(respons.body.meta.totalData).toBe(2);
      expect(respons.body.meta.totalHalaman).toBe(1);
      expect(respons.body.data).toHaveLength(2);
      for (const item of respons.body.data as { kategori_id: number; kondisi: string }[]) {
        expect(item.kategori_id).toBe(kategoriKomputer.id);
        expect(item.kondisi).toBe("Baik");
      }
    });

    it("search berdasarkan kode/nama bekerja case-insensitive", async () => {
      const respons = await request(aplikasi)
        .get("/api/barang")
        .query({ search: "proyektor" })
        .set("Cookie", cookieViewer);

      expect(respons.status).toBe(200);
      expect(respons.body.meta.totalData).toBe(1);
      expect(respons.body.data[0].kode_barang).toBe("PRJ-003");
    });

    it("pagination membatasi jumlah data sesuai limit dan menghitung totalHalaman", async () => {
      const respons = await request(aplikasi)
        .get("/api/barang")
        .query({ limit: 3, page: 1 })
        .set("Cookie", cookieViewer);

      expect(respons.status).toBe(200);
      expect(respons.body.data.length).toBeLessThanOrEqual(3);
      expect(respons.body.meta.batas).toBe(3);
      expect(respons.body.meta.totalHalaman).toBe(Math.ceil(respons.body.meta.totalData / 3));
    });

    it("sort dengan kolom di luar whitelist tidak menyebabkan error (fallback default)", async () => {
      const respons = await request(aplikasi)
        .get("/api/barang")
        .query({ sort: "password", order: "asc" })
        .set("Cookie", cookieViewer);

      // Query tervalidasi menolak nilai sort di luar whitelist sebelum sampai ke database.
      expect(respons.status).toBe(422);
    });
  });
});
