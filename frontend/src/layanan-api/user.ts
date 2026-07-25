import { permintaanApi } from "@/layanan-api/klien";
import type { Pengguna, RolePengguna } from "@/tipe/pengguna";
import type { MetaPagination } from "@/tipe/respons-api";

export interface FilterUser {
  page?: number;
  limit?: number;
  search?: string;
  role?: RolePengguna;
}

export interface NilaiFormBuatUser {
  nama: string;
  email: string;
  password: string;
  role: RolePengguna;
}

export interface NilaiFormPerbaruiUser {
  nama: string;
  email: string;
  role: RolePengguna;
}

export interface NilaiResetPassword {
  passwordBaru: string;
  konfirmasiPassword: string;
}

export async function daftarUser(
  filter: FilterUser,
): Promise<{ data: Pengguna[]; meta?: MetaPagination }> {
  const hasil = await permintaanApi<Pengguna[]>("/users", {
    query: {
      page: filter.page,
      limit: filter.limit,
      search: filter.search,
      role: filter.role,
    },
  });
  return { data: hasil.data, meta: hasil.meta };
}

export async function buatUser(nilai: NilaiFormBuatUser): Promise<Pengguna> {
  const hasil = await permintaanApi<Pengguna>("/users", { method: "POST", body: nilai });
  return hasil.data;
}

export async function perbaruiUser(id: number, nilai: NilaiFormPerbaruiUser): Promise<Pengguna> {
  const hasil = await permintaanApi<Pengguna>(`/users/${id}`, { method: "PUT", body: nilai });
  return hasil.data;
}

export async function hapusUser(id: number): Promise<void> {
  await permintaanApi(`/users/${id}`, { method: "DELETE" });
}

export async function resetPasswordUser(id: number, nilai: NilaiResetPassword): Promise<void> {
  await permintaanApi(`/users/${id}/reset-password`, { method: "PATCH", body: nilai });
}
