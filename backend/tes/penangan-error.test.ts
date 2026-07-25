import express from "express";
import request from "supertest";

import { buatAplikasi } from "@/aplikasi";
import { penanganErrorPusat, penanganRuteTidakDitemukan } from "@/middleware/penangan-error";
import { KesalahanAplikasi } from "@/tipe/kesalahan-aplikasi";
import { logger } from "@/utilitas/logger";

const aplikasi = buatAplikasi();

// Aplikasi kecil khusus pengujian error handler. Rute-rute di bawah sengaja melempar error
// agar jalur 500 "terkontrol" bisa dibuktikan tanpa harus merusak koneksi database asli.
function buatAplikasiUjiError() {
  const app = express();

  // Meniru bug tak terduga di controller (mis. properti undefined dibaca).
  app.get("/uji/error-tak-terduga", () => {
    throw new Error("Simulasi bug internal: koneksi repository gagal secara tak terduga.");
  });

  // Meniru error async yang di-forward ke next() - jalur paling umum di controller nyata.
  app.get("/uji/error-async", (_req, _res, next) => {
    next(new Error("Simulasi kegagalan query database."));
  });

  // Error terduga tetap harus memakai status code miliknya sendiri, bukan 500.
  app.get("/uji/error-terduga", (_req, _res, next) => {
    next(new KesalahanAplikasi(422, "Data yang dikirim tidak valid."));
  });

  app.use(penanganRuteTidakDitemukan);
  app.use(penanganErrorPusat);
  return app;
}
const aplikasiUjiError = buatAplikasiUjiError();

// Error tak terduga sengaja dicatat penuh oleh logger. Selama pengujian, log tersebut dibisukan
// agar output Jest tidak dipenuhi stack trace yang memang diharapkan muncul.
let matikanLog: jest.SpyInstance;
beforeAll(() => {
  matikanLog = jest.spyOn(logger, "error").mockImplementation(() => undefined);
});
afterAll(() => {
  matikanLog.mockRestore();
});

describe("Penanganan error 500 terkontrol", () => {
  it.each([
    ["error dilempar sinkron", "/uji/error-tak-terduga"],
    ["error diteruskan lewat next()", "/uji/error-async"],
  ])("%s menghasilkan 500 dengan format respons baku", async (_label, path) => {
    const respons = await request(aplikasiUjiError).get(path);

    expect(respons.status).toBe(500);
    expect(respons.body.sukses).toBe(false);
    expect(typeof respons.body.pesan).toBe("string");
  });

  it("tidak pernah membocorkan stack trace atau nama file internal ke client", async () => {
    const respons = await request(aplikasiUjiError).get("/uji/error-tak-terduga");

    const badan = JSON.stringify(respons.body);
    expect(badan).not.toMatch(/at\s+\w+\s+\(/); // pola baris stack trace
    expect(badan).not.toContain("node_modules");
    expect(badan).not.toContain(".ts:");
    expect(badan).not.toContain("stack");
    // Respons hanya boleh berisi kunci kontrak baku, tanpa properti debug tambahan.
    expect(Object.keys(respons.body).sort()).toEqual(["pesan", "sukses"]);
  });

  it("error terduga tetap memakai status code aslinya, tidak diturunkan menjadi 500", async () => {
    const respons = await request(aplikasiUjiError).get("/uji/error-terduga");

    expect(respons.status).toBe(422);
    expect(respons.body.pesan).toBe("Data yang dikirim tidak valid.");
  });
});

describe("Penanganan rute tidak ditemukan", () => {
  it("mengembalikan 404 dengan format baku untuk endpoint yang tidak terdaftar", async () => {
    const respons = await request(aplikasi).get("/api/endpoint-yang-tidak-ada");

    expect(respons.status).toBe(404);
    expect(respons.body.sukses).toBe(false);
    expect(respons.body.pesan).toContain("tidak ditemukan");
  });
});
