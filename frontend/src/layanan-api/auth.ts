import { permintaanApi } from "@/layanan-api/klien";
import type { Pengguna } from "@/tipe/pengguna";

export interface DataLogin {
  email: string;
  password: string;
  ingatSaya: boolean;
}

export interface DataRegister {
  nama: string;
  email: string;
  password: string;
  konfirmasiPassword: string;
}

export async function login(data: DataLogin): Promise<Pengguna> {
  const hasil = await permintaanApi<Pengguna>("/auth/login", { method: "POST", body: data });
  return hasil.data;
}

export async function register(data: DataRegister): Promise<Pengguna> {
  const hasil = await permintaanApi<Pengguna>("/auth/register", { method: "POST", body: data });
  return hasil.data;
}

// Dipanggil AuthProvider saat aplikasi dimuat untuk memeriksa sesi yang masih aktif (cookie JWT).
export async function ambilPenggunaAktif(): Promise<Pengguna> {
  const hasil = await permintaanApi<Pengguna>("/auth/me");
  return hasil.data;
}

export async function logout(): Promise<void> {
  await permintaanApi("/auth/logout", { method: "POST" });
}
