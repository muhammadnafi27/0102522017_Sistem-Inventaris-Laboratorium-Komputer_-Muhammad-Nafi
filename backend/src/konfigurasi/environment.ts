import dotenv from "dotenv";

// Memuat variabel dari file .env ke process.env sebelum divalidasi.
// quiet: true menonaktifkan log promosi bawaan dotenv agar output server tetap bersih saat demo.
dotenv.config({ quiet: true });

// Daftar nama variabel environment yang wajib ada agar server tidak berjalan dengan konfigurasi tidak lengkap.
const variabelWajib = [
  "PORT",
  "FRONTEND_URL",
  "DB_HOST",
  "DB_PORT",
  "DB_USER",
  "DB_NAME",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
] as const;

// Memastikan seluruh variabel wajib tersedia. Server dihentikan lebih awal bila ada yang hilang
// supaya kesalahan konfigurasi tidak muncul secara samar saat runtime.
function validasiEnvironment(): void {
  const variabelHilang = variabelWajib.filter((nama) => !process.env[nama]);

  if (variabelHilang.length > 0) {
    throw new Error(
      `Konfigurasi environment tidak lengkap. Variabel berikut wajib diisi pada file .env: ${variabelHilang.join(", ")}`,
    );
  }

  if ((process.env.JWT_SECRET ?? "").length < 32) {
    throw new Error("JWT_SECRET wajib memiliki panjang minimal 32 karakter.");
  }
}

validasiEnvironment();

// Objek konfigurasi terpusat agar seluruh modul membaca environment dari satu sumber yang sudah tervalidasi.
export const environment = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT),
  frontendUrl: process.env.FRONTEND_URL as string,
  db: {
    host: process.env.DB_HOST as string,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME as string,
  },
  jwt: {
    secret: process.env.JWT_SECRET as string,
    expiresIn: process.env.JWT_EXPIRES_IN as string,
    expiresInIngatSaya: process.env.JWT_EXPIRES_IN_INGAT_SAYA ?? "7d",
  },
  uploadMaxMb: Number(process.env.UPLOAD_MAX_MB ?? 2),
  isProduction: (process.env.NODE_ENV ?? "development") === "production",
};
