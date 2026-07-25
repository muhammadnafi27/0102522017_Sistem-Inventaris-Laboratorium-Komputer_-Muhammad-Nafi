import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Application } from "express";
import helmet from "helmet";
import morgan from "morgan";

import { environment } from "@/konfigurasi/environment";
import { penanganErrorPusat, penanganRuteTidakDitemukan } from "@/middleware/penangan-error";
import ruteAktivitas from "@/rute/aktivitas.rute";
import ruteAuth from "@/rute/auth.rute";
import ruteBarang from "@/rute/barang.rute";
import ruteDashboard from "@/rute/dashboard.rute";
import ruteKategori from "@/rute/kategori.rute";
import ruteKesehatan from "@/rute/kesehatan.rute";
import ruteProfil from "@/rute/profil.rute";
import ruteUser from "@/rute/user.rute";

// Membuat dan mengonfigurasi instance Express. Dipisah dari server.ts agar aplikasi
// dapat diimpor langsung oleh test integrasi tanpa perlu membuka port sungguhan.
export function buatAplikasi(): Application {
  const aplikasi = express();

  // Helmet menambahkan header keamanan HTTP standar (mis. X-Content-Type-Options, HSTS).
  aplikasi.use(helmet());

  // CORS hanya mengizinkan origin frontend yang eksplisit dan mengizinkan cookie (credentials).
  aplikasi.use(
    cors({
      origin: environment.frontendUrl,
      credentials: true,
    }),
  );

  // Morgan mencatat setiap request masuk; format "dev" ringkas dan cukup untuk kebutuhan demo.
  aplikasi.use(morgan(environment.isProduction ? "combined" : "dev"));

  // Parser body JSON dan urlencoded dengan batas ukuran agar terlindung dari payload berlebihan.
  aplikasi.use(express.json({ limit: "1mb" }));
  aplikasi.use(express.urlencoded({ extended: true, limit: "1mb" }));

  // Cookie parser dibutuhkan karena JWT disimpan pada cookie HttpOnly, bukan header Authorization.
  aplikasi.use(cookieParser());

  // Menyajikan file upload statis (foto barang) melalui path /uploads.
  // crossOriginResourcePolicy "cross-origin" WAJIB di sini: helmet() secara default memasang
  // Cross-Origin-Resource-Policy: same-origin, sehingga <img> di frontend (port 3001) diblokir
  // browser saat memuat foto dari backend (port 3000) dengan ERR_BLOCKED_BY_RESPONSE.NotSameOrigin.
  // Pelonggaran dibatasi hanya pada folder gambar publik ini; endpoint /api tetap memakai
  // header ketat bawaan helmet.
  aplikasi.use(
    "/uploads",
    helmet.crossOriginResourcePolicy({ policy: "cross-origin" }),
    express.static("unggahan"),
  );

  // Seluruh endpoint REST API diprefix dengan /api sesuai kontrak PRD.
  aplikasi.use("/api", ruteKesehatan);
  aplikasi.use("/api/auth", ruteAuth);
  aplikasi.use("/api/kategori", ruteKategori);
  aplikasi.use("/api/barang", ruteBarang);
  aplikasi.use("/api/dashboard", ruteDashboard);
  aplikasi.use("/api/users", ruteUser);
  aplikasi.use("/api/profil", ruteProfil);
  aplikasi.use("/api/aktivitas", ruteAktivitas);

  // Middleware 404 harus didaftarkan setelah semua rute agar hanya menangkap path yang tidak cocok.
  aplikasi.use(penanganRuteTidakDitemukan);

  // Error handler pusat wajib menjadi middleware paling akhir.
  aplikasi.use(penanganErrorPusat);

  return aplikasi;
}
