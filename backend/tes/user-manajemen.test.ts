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

describe("Manajemen User - pembatasan role", () => {
  it("operator dan viewer ditolak 403 pada seluruh endpoint /api/users", async () => {
    for (const cookie of [cookieOperator, cookieViewer]) {
      expect((await request(aplikasi).get("/api/users").set("Cookie", cookie)).status).toBe(403);
      expect(
        (
          await request(aplikasi)
            .post("/api/users")
            .set("Cookie", cookie)
            .send({ nama: "X", email: "x@x.com", password: "password123", role: "viewer" })
        ).status,
      ).toBe(403);
      expect((await request(aplikasi).get("/api/users/1").set("Cookie", cookie)).status).toBe(403);
      expect((await request(aplikasi).put("/api/users/1").set("Cookie", cookie).send({})).status).toBe(
        403,
      );
      expect((await request(aplikasi).delete("/api/users/1").set("Cookie", cookie)).status).toBe(403);
      expect(
        (
          await request(aplikasi)
            .patch("/api/users/1/reset-password")
            .set("Cookie", cookie)
            .send({ passwordBaru: "password123", konfirmasiPassword: "password123" })
        ).status,
      ).toBe(403);
    }
  });

  it("operator dan viewer ditolak 403 pada GET /api/aktivitas", async () => {
    expect((await request(aplikasi).get("/api/aktivitas").set("Cookie", cookieOperator)).status).toBe(
      403,
    );
    expect((await request(aplikasi).get("/api/aktivitas").set("Cookie", cookieViewer)).status).toBe(403);
  });
});

describe("Manajemen User - CRUD admin", () => {
  it("admin dapat melakukan siklus lengkap create->read->update->delete", async () => {
    const email = `UJI-USER-${Date.now()}@Contoh.COM`;

    const buat = await request(aplikasi).post("/api/users").set("Cookie", cookieAdmin).send({
      nama: "Pengguna Uji",
      email,
      password: "password123",
      role: "viewer",
    });

    expect(buat.status).toBe(201);
    // Email wajib dinormalisasi lowercase meski dikirim campuran huruf besar/kecil.
    expect(buat.body.data.email).toBe(email.toLowerCase());
    expect(buat.body.data.password).toBeUndefined();
    expect(buat.body.data.reset_token).toBeUndefined();
    const id = buat.body.data.id as number;

    const detail = await request(aplikasi).get(`/api/users/${id}`).set("Cookie", cookieAdmin);
    expect(detail.status).toBe(200);
    expect(detail.body.data.nama).toBe("Pengguna Uji");

    const perbarui = await request(aplikasi).put(`/api/users/${id}`).set("Cookie", cookieAdmin).send({
      nama: "Pengguna Uji Diperbarui",
      email,
      role: "operator",
    });
    expect(perbarui.status).toBe(200);
    expect(perbarui.body.data.role).toBe("operator");
    expect(perbarui.body.data.nama).toBe("Pengguna Uji Diperbarui");

    const daftar = await request(aplikasi)
      .get("/api/users")
      .query({ search: "Pengguna Uji Diperbarui" })
      .set("Cookie", cookieAdmin);
    expect(daftar.status).toBe(200);
    expect(daftar.body.data.some((u: { id: number }) => u.id === id)).toBe(true);
    expect(daftar.body.data[0].password).toBeUndefined();

    const hapus = await request(aplikasi).delete(`/api/users/${id}`).set("Cookie", cookieAdmin);
    expect(hapus.status).toBe(200);

    const setelahHapus = await request(aplikasi).get(`/api/users/${id}`).set("Cookie", cookieAdmin);
    expect(setelahHapus.status).toBe(404);
  });

  it("menolak email duplikat dengan 409 saat create maupun update", async () => {
    const buatDuplikat = await request(aplikasi).post("/api/users").set("Cookie", cookieAdmin).send({
      nama: "Duplikat",
      email: "admin@uai.ac.id",
      password: "password123",
      role: "viewer",
    });
    expect(buatDuplikat.status).toBe(409);
    expect(buatDuplikat.body.kesalahan?.[0]?.field).toBe("email");

    const buatSementara = await request(aplikasi).post("/api/users").set("Cookie", cookieAdmin).send({
      nama: "Sementara",
      email: `UJI-SEMENTARA-${Date.now()}@uai.ac.id`,
      password: "password123",
      role: "viewer",
    });
    const id = buatSementara.body.data.id as number;

    const perbaruiDuplikat = await request(aplikasi).put(`/api/users/${id}`).set("Cookie", cookieAdmin).send({
      nama: "Sementara",
      email: "staff@uai.ac.id",
      role: "viewer",
    });
    expect(perbaruiDuplikat.status).toBe(409);

    await request(aplikasi).delete(`/api/users/${id}`).set("Cookie", cookieAdmin);
  });

  it("menolak validasi password lemah dan role tidak valid dengan 422", async () => {
    const passwordLemah = await request(aplikasi).post("/api/users").set("Cookie", cookieAdmin).send({
      nama: "Password Lemah",
      email: `UJI-LEMAH-${Date.now()}@uai.ac.id`,
      password: "pendek",
      role: "viewer",
    });
    expect(passwordLemah.status).toBe(422);

    const roleSalah = await request(aplikasi).post("/api/users").set("Cookie", cookieAdmin).send({
      nama: "Role Salah",
      email: `UJI-ROLE-${Date.now()}@uai.ac.id`,
      password: "password123",
      role: "superadmin",
    });
    expect(roleSalah.status).toBe(422);
  });

  it("admin tidak dapat menghapus akunnya sendiri", async () => {
    const respons = await request(aplikasi).delete("/api/users/1").set("Cookie", cookieAdmin);
    expect(respons.status).toBe(409);

    // Pastikan akun admin tetap ada dan masih bisa login setelah percobaan gagal.
    const cekMasihAda = await request(aplikasi).get("/api/users/1").set("Cookie", cookieAdmin);
    expect(cekMasihAda.status).toBe(200);
  });

  it("sistem menolak menurunkan role admin terakhir (tidak boleh kehilangan admin aktif)", async () => {
    // Buat admin kedua sementara agar ada 2 admin, lalu hapus lagi supaya kembali ke 1 admin -
    // membuktikan operasi normal berjalan saat admin > 1.
    const buatAdminKedua = await request(aplikasi).post("/api/users").set("Cookie", cookieAdmin).send({
      nama: "Admin Kedua Sementara",
      email: `UJI-ADMIN2-${Date.now()}@uai.ac.id`,
      password: "password123",
      role: "admin",
    });
    expect(buatAdminKedua.status).toBe(201);
    const idAdminKedua = buatAdminKedua.body.data.id as number;

    const hapusAdminKedua = await request(aplikasi)
      .delete(`/api/users/${idAdminKedua}`)
      .set("Cookie", cookieAdmin);
    expect(hapusAdminKedua.status).toBe(200);

    // Sekarang hanya tersisa 1 admin (seed). Menurunkan role admin ini ke viewer harus ditolak.
    const turunkanRole = await request(aplikasi).put("/api/users/1").set("Cookie", cookieAdmin).send({
      nama: "Admin",
      email: "admin@uai.ac.id",
      role: "viewer",
    });
    expect(turunkanRole.status).toBe(409);

    const cekRoleTetapAdmin = await request(aplikasi).get("/api/users/1").set("Cookie", cookieAdmin);
    expect(cekRoleTetapAdmin.body.data.role).toBe("admin");
  });
});

describe("Reset password oleh admin", () => {
  it("setelah reset, password lama gagal login dan password baru berhasil login", async () => {
    const emailUji = `UJI-RESET-${Date.now()}@uai.ac.id`;
    const buat = await request(aplikasi).post("/api/users").set("Cookie", cookieAdmin).send({
      nama: "Uji Reset Password",
      email: emailUji,
      password: "passwordLama123",
      role: "viewer",
    });
    const id = buat.body.data.id as number;

    const loginLamaSebelum = await request(aplikasi)
      .post("/api/auth/login")
      .send({ email: emailUji, password: "passwordLama123" });
    expect(loginLamaSebelum.status).toBe(200);

    const reset = await request(aplikasi)
      .patch(`/api/users/${id}/reset-password`)
      .set("Cookie", cookieAdmin)
      .send({ passwordBaru: "passwordBaru456", konfirmasiPassword: "passwordBaru456" });
    expect(reset.status).toBe(200);

    const loginLamaSesudah = await request(aplikasi)
      .post("/api/auth/login")
      .send({ email: emailUji, password: "passwordLama123" });
    expect(loginLamaSesudah.status).toBe(401);

    const loginBaru = await request(aplikasi)
      .post("/api/auth/login")
      .send({ email: emailUji, password: "passwordBaru456" });
    expect(loginBaru.status).toBe(200);

    await request(aplikasi).delete(`/api/users/${id}`).set("Cookie", cookieAdmin);
  });

  it("menolak konfirmasi password yang tidak cocok dengan 422", async () => {
    const respons = await request(aplikasi)
      .patch("/api/users/1/reset-password")
      .set("Cookie", cookieAdmin)
      .send({ passwordBaru: "passwordBaru456", konfirmasiPassword: "tidakcocok789" });
    expect(respons.status).toBe(422);
  });
});

describe("GET/PUT /api/profil", () => {
  it("pengguna dapat melihat dan memperbarui profil miliknya sendiri", async () => {
    const lihat = await request(aplikasi).get("/api/profil").set("Cookie", cookieViewer);
    expect(lihat.status).toBe(200);
    expect(lihat.body.data.email).toBe("nafiazka2003@gmail.com");
    expect(lihat.body.data.password).toBeUndefined();

    const perbarui = await request(aplikasi)
      .put("/api/profil")
      .set("Cookie", cookieViewer)
      .send({ nama: "Muhammad Nafi (Diperbarui)", role: "admin" });

    expect(perbarui.status).toBe(200);
    expect(perbarui.body.data.nama).toBe("Muhammad Nafi (Diperbarui)");
    // role dikirim di body tetapi wajib diabaikan - pengguna tidak dapat menaikkan role sendiri.
    expect(perbarui.body.data.role).toBe("viewer");

    // Kembalikan nama seperti semula agar tidak mengubah data seed secara permanen.
    await request(aplikasi)
      .put("/api/profil")
      .set("Cookie", cookieViewer)
      .send({ nama: "Muhammad Nafi" });
  });

  it("menolak perubahan email ke email yang sudah dipakai pengguna lain dengan 409", async () => {
    const respons = await request(aplikasi)
      .put("/api/profil")
      .set("Cookie", cookieViewer)
      .send({ nama: "Muhammad Nafi", email: "admin@uai.ac.id" });
    expect(respons.status).toBe(409);
  });
});

describe("GET /api/aktivitas", () => {
  it("admin dapat melihat daftar aktivitas dengan pagination dan filter aksi", async () => {
    const daftar = await request(aplikasi)
      .get("/api/aktivitas")
      .query({ limit: 5, page: 1 })
      .set("Cookie", cookieAdmin);

    expect(daftar.status).toBe(200);
    expect(daftar.body.data.length).toBeLessThanOrEqual(5);
    expect(daftar.body.meta.batas).toBe(5);
    expect(daftar.body.meta.totalHalaman).toBe(Math.ceil(daftar.body.meta.totalData / 5));

    const filterLogin = await request(aplikasi)
      .get("/api/aktivitas")
      .query({ aksi: "LOGIN", limit: 50 })
      .set("Cookie", cookieAdmin);
    expect(filterLogin.status).toBe(200);
    for (const item of filterLogin.body.data as { aksi: string }[]) {
      expect(item.aksi).toBe("LOGIN");
    }
  });
});
