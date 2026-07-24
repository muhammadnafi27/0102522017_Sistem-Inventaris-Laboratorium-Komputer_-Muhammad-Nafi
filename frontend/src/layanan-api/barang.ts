import { permintaanApi } from "@/layanan-api/klien";
import type { Barang, FilterBarang, NilaiFormBarang } from "@/tipe/barang";
import type { MetaPagination } from "@/tipe/respons-api";

// Mengambil daftar barang dengan filter/pagination. Nilai filter kosong tidak dikirim
// (ditangani bangunQueryString di dalam klien).
export async function daftarBarang(
  filter: FilterBarang,
): Promise<{ data: Barang[]; meta?: MetaPagination }> {
  const hasil = await permintaanApi<Barang[]>("/barang", {
    query: {
      page: filter.page,
      limit: filter.limit,
      search: filter.search,
      kategori_id: filter.kategori_id,
      kondisi: filter.kondisi,
      lokasi: filter.lokasi,
      sort: filter.sort,
      order: filter.order,
    },
  });
  return { data: hasil.data, meta: hasil.meta };
}

export async function detailBarang(id: number): Promise<Barang> {
  const hasil = await permintaanApi<Barang>(`/barang/${id}`);
  return hasil.data;
}

export async function daftarLokasi(): Promise<string[]> {
  const hasil = await permintaanApi<string[]>("/barang/opsi-lokasi");
  return hasil.data;
}

// Menyusun FormData dari nilai form. Foto hanya disertakan bila pengguna memilih file baru,
// sehingga pada mode edit tanpa ganti foto, backend mempertahankan foto lama.
function keFormData(nilai: NilaiFormBarang): FormData {
  const form = new FormData();
  form.set("kode_barang", nilai.kode_barang);
  form.set("nama_barang", nilai.nama_barang);
  form.set("kategori_id", nilai.kategori_id);
  form.set("kondisi", nilai.kondisi);
  form.set("lokasi", nilai.lokasi);
  form.set("jumlah", nilai.jumlah);
  if (nilai.foto) {
    form.set("foto", nilai.foto);
  }
  return form;
}

export async function buatBarang(nilai: NilaiFormBarang): Promise<Barang> {
  const hasil = await permintaanApi<Barang>("/barang", {
    method: "POST",
    body: keFormData(nilai),
  });
  return hasil.data;
}

export async function perbaruiBarang(id: number, nilai: NilaiFormBarang): Promise<Barang> {
  const hasil = await permintaanApi<Barang>(`/barang/${id}`, {
    method: "PUT",
    body: keFormData(nilai),
  });
  return hasil.data;
}

export async function hapusBarang(id: number): Promise<void> {
  await permintaanApi(`/barang/${id}`, { method: "DELETE" });
}
