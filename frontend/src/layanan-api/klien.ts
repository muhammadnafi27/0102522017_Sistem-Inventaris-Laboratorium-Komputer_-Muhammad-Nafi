import type { KesalahanField, MetaPagination } from "@/tipe/respons-api";
import { bangunQueryString } from "@/utilitas/query-string";

const URL_DASAR_API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

// Error terstandarisasi untuk seluruh pemanggilan API. Komponen form cukup menangani satu
// jenis error ini (pesan umum + opsional daftar kesalahan per-field) tanpa perlu tahu detail
// fetch/parsing di baliknya.
export class KesalahanApi extends Error {
  status: number;
  kesalahan?: KesalahanField[];

  constructor(status: number, pesan: string, kesalahan?: KesalahanField[]) {
    super(pesan);
    this.name = "KesalahanApi";
    this.status = status;
    this.kesalahan = kesalahan;
  }
}

export type MetodeHttp = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface OpsiPermintaan {
  method?: MetodeHttp;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
}

export interface HasilPermintaan<T> {
  data: T;
  meta?: MetaPagination;
}

// Helper fetch terpusat dipakai seluruh modul layanan-api. Tanggung jawabnya:
// 1) menyusun URL dari NEXT_PUBLIC_API_URL + path + query string,
// 2) selalu menyertakan cookie (credentials: "include") karena JWT disimpan sebagai cookie HttpOnly,
// 3) mem-parsing format respons baku backend {sukses, pesan, data, meta}/{sukses:false, kesalahan},
// 4) melempar KesalahanApi yang seragam untuk seluruh kasus gagal (validasi, network, dsb).
export async function permintaanApi<T = unknown>(
  path: string,
  opsi: OpsiPermintaan = {},
): Promise<HasilPermintaan<T>> {
  const url = `${URL_DASAR_API}${path}${bangunQueryString(opsi.query)}`;

  const headers: HeadersInit = {};
  let body: BodyInit | undefined;

  if (opsi.body instanceof FormData) {
    // Content-Type sengaja tidak diset manual untuk FormData (upload foto) agar browser
    // menuliskan boundary multipart yang benar sendiri.
    body = opsi.body;
  } else if (opsi.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opsi.body);
  }

  let respons: Response;
  try {
    respons = await fetch(url, {
      method: opsi.method ?? "GET",
      credentials: "include",
      headers,
      body,
    });
  } catch {
    throw new KesalahanApi(0, "Tidak dapat terhubung ke server. Periksa koneksi Anda.");
  }

  // Respons tanpa body (mis. 204) atau body bukan JSON valid diperlakukan sebagai null,
  // bukan dilempar sebagai error parsing yang membingungkan.
  const json = await respons.json().catch(() => null);

  if (!respons.ok || !json?.sukses) {
    throw new KesalahanApi(
      respons.status,
      json?.pesan ?? "Terjadi kesalahan pada server. Silakan coba lagi.",
      json?.kesalahan,
    );
  }

  return { data: json.data as T, meta: json.meta as MetaPagination | undefined };
}
