import cookieParser from "cookie-parser";
import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";

import { buatAplikasi } from "@/aplikasi";
import { tutupPoolDatabase } from "@/konfigurasi/database";
import { environment } from "@/konfigurasi/environment";
import { autentikasi } from "@/middleware/autentikasi";
import { penanganErrorPusat, penanganRuteTidakDitemukan } from "@/middleware/penangan-error";
import { authorizeRoles } from "@/middleware/otorisasi";
import { usersRepository } from "@/repository/users.repository";
import { responsSukses } from "@/utilitas/respons";

const aplikasi = buatAplikasi();

// Aplikasi kecil khusus pengujian untuk membuktikan middleware authorizeRoles benar-benar
// menolak role yang tidak diizinkan (route test admin-only sesuai kriteria penerimaan PRD).
function buatAplikasiUjiRole() {
  const app = express();
  app.use(cookieParser());
  app.get("/uji/admin-saja", autentikasi, authorizeRoles("admin"), (req, res) => {
    responsSukses(res, 200, "Akses admin diterima.", req.pengguna);
  });
  app.use(penanganRuteTidakDitemukan);
  app.use(penanganErrorPusat);
  return app;
}
const aplikasiUjiRole = buatAplikasiUjiRole();

// Menutup pool database setelah seluruh pengujian di file ini selesai agar proses Jest
// tidak menggantung karena koneksi mysql2 masih terbuka.
afterAll(async () => {
  await tutupPoolDatabase();
});

describe("POST /api/auth/login", () => {
  it.each([
    ["admin@uai.ac.id", "admin12345", "admin"],
    ["staff@uai.ac.id", "staff12345", "operator"],
    ["nafiazka2003@gmail.com", "Nafi12345", "viewer"],
  ])("akun seed %s dapat login dan mendapat role %s", async (email, password, role) => {
    const respons = await request(aplikasi).post("/api/auth/login").send({ email, password });

    expect(respons.status).toBe(200);
    expect(respons.body.sukses).toBe(true);
    expect(respons.body.data.role).toBe(role);
    expect(respons.body.data.password).toBeUndefined();
    expect(respons.headers["set-cookie"]?.[0]).toMatch(/access_token=/);
    expect(respons.headers["set-cookie"]?.[0]).toMatch(/HttpOnly/i);
  });

  it("menolak password salah dengan pesan generik", async () => {
    const respons = await request(aplikasi)
      .post("/api/auth/login")
      .send({ email: "admin@uai.ac.id", password: "password-salah-123" });

    expect(respons.status).toBe(401);
    expect(respons.body.sukses).toBe(false);
    expect(respons.body.pesan).toBe("Email atau password salah.");
  });

  it("menolak email yang tidak terdaftar dengan pesan generik yang sama", async () => {
    const respons = await request(aplikasi)
      .post("/api/auth/login")
      .send({ email: "tidak-ada@uai.ac.id", password: "apapun12345" });

    expect(respons.status).toBe(401);
    expect(respons.body.pesan).toBe("Email atau password salah.");
  });

  it("menolak body tidak valid dengan status 422", async () => {
    const respons = await request(aplikasi)
      .post("/api/auth/login")
      .send({ email: "bukan-email", password: "" });

    expect(respons.status).toBe(422);
    expect(respons.body.sukses).toBe(false);
    expect(Array.isArray(respons.body.kesalahan)).toBe(true);
  });
});

describe("Alur login -> /api/auth/me -> logout", () => {
  it("me hanya berhasil setelah login, dan logout membuat me kembali 401", async () => {
    const agen = request.agent(aplikasi);

    const sebelumLogin = await agen.get("/api/auth/me");
    expect(sebelumLogin.status).toBe(401);

    const login = await agen.post("/api/auth/login").send({
      email: "admin@uai.ac.id",
      password: "admin12345",
    });
    expect(login.status).toBe(200);

    const setelahLogin = await agen.get("/api/auth/me");
    expect(setelahLogin.status).toBe(200);
    expect(setelahLogin.body.data.email).toBe("admin@uai.ac.id");
    expect(setelahLogin.body.data.role).toBe("admin");

    const logout = await agen.post("/api/auth/logout");
    expect(logout.status).toBe(200);

    const setelahLogout = await agen.get("/api/auth/me");
    expect(setelahLogout.status).toBe(401);
  });
});

describe("GET /api/auth/me - penanganan token bermasalah", () => {
  it("menolak request tanpa token dengan 401", async () => {
    const respons = await request(aplikasi).get("/api/auth/me");
    expect(respons.status).toBe(401);
    expect(respons.body.pesan).toBe("Anda belum login.");
  });

  it("menolak token yang tidak valid/rusak dengan 401", async () => {
    const respons = await request(aplikasi)
      .get("/api/auth/me")
      .set("Authorization", "Bearer token-acak-tidak-valid");

    expect(respons.status).toBe(401);
    expect(respons.body.pesan).toBe("Token tidak valid.");
  });

  it("menolak token yang sudah kedaluwarsa dengan 401", async () => {
    const tokenKedaluwarsa = jwt.sign(
      { sub: 1, email: "admin@uai.ac.id", role: "admin" },
      environment.jwt.secret,
      { expiresIn: -10 },
    );

    const respons = await request(aplikasi)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${tokenKedaluwarsa}`);

    expect(respons.status).toBe(401);
    expect(respons.body.pesan).toBe("Sesi telah berakhir, silakan login kembali.");
  });
});

describe("POST /api/auth/register", () => {
  const emailBaru = `test-register-${Date.now()}@uai.ac.id`;

  afterAll(async () => {
    // Membersihkan akun uji agar tidak menumpuk setiap kali test suite dijalankan ulang.
    const baris = await usersRepository.cariByEmail(emailBaru);
    if (baris) {
      await usersRepository.hapus(baris.id);
    }
  });

  it("berhasil register dan memaksa role viewer meski body mengirim role lain", async () => {
    const respons = await request(aplikasi).post("/api/auth/register").send({
      nama: "Pengguna Uji",
      email: emailBaru,
      password: "password123",
      konfirmasiPassword: "password123",
      role: "admin",
    });

    expect(respons.status).toBe(201);
    expect(respons.body.data.role).toBe("viewer");
    expect(respons.body.data.password).toBeUndefined();
  });

  it("menolak email yang sudah terdaftar dengan 409", async () => {
    const respons = await request(aplikasi).post("/api/auth/register").send({
      nama: "Percobaan Duplikat",
      email: "admin@uai.ac.id",
      password: "password123",
      konfirmasiPassword: "password123",
    });

    expect(respons.status).toBe(409);
    expect(respons.body.kesalahan?.[0]?.field).toBe("email");
  });

  it("menolak password lemah dengan 422", async () => {
    const respons = await request(aplikasi).post("/api/auth/register").send({
      nama: "Pengguna Lemah",
      email: `lemah-${Date.now()}@uai.ac.id`,
      password: "pendek",
      konfirmasiPassword: "pendek",
    });

    expect(respons.status).toBe(422);
  });
});

describe("Middleware authorizeRoles - route test admin-only", () => {
  async function ambilTokenCookie(email: string, password: string): Promise<string> {
    const login = await request(aplikasi).post("/api/auth/login").send({ email, password });
    const cookie = login.headers["set-cookie"]?.[0];
    if (!cookie) {
      throw new Error(`Login gagal untuk ${email} saat menyiapkan pengujian role.`);
    }
    return cookie;
  }

  it("admin diterima (200) pada endpoint admin-only", async () => {
    const cookie = await ambilTokenCookie("admin@uai.ac.id", "admin12345");
    const respons = await request(aplikasiUjiRole).get("/uji/admin-saja").set("Cookie", cookie);
    expect(respons.status).toBe(200);
  });

  it("operator ditolak (403) pada endpoint admin-only", async () => {
    const cookie = await ambilTokenCookie("staff@uai.ac.id", "staff12345");
    const respons = await request(aplikasiUjiRole).get("/uji/admin-saja").set("Cookie", cookie);
    expect(respons.status).toBe(403);
  });

  it("viewer ditolak (403) pada endpoint admin-only", async () => {
    const cookie = await ambilTokenCookie("nafiazka2003@gmail.com", "Nafi12345");
    const respons = await request(aplikasiUjiRole).get("/uji/admin-saja").set("Cookie", cookie);
    expect(respons.status).toBe(403);
  });

  it("tanpa login ditolak (401) pada endpoint admin-only", async () => {
    const respons = await request(aplikasiUjiRole).get("/uji/admin-saja");
    expect(respons.status).toBe(401);
  });
});
