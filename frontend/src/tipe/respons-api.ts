// Bentuk error per-field dan meta pagination ini mengikuti format respons baku backend
// (lihat backend/src/utilitas/respons.ts) supaya frontend tidak perlu mapping ulang.
export interface KesalahanField {
  field: string;
  pesan: string;
}

export interface MetaPagination {
  halaman: number;
  batas: number;
  totalData: number;
  totalHalaman: number;
}
