// Konsisten dengan AktivitasDenganUserRow pada backend - baris aktivitas_sistem hasil
// LEFT JOIN users, sehingga nama/email pelaku bisa null bila akun pelaku sudah dihapus.
export interface Aktivitas {
  id: number;
  user_id: number | null;
  aksi: string;
  entitas: string;
  entitas_id: number | null;
  detail: string | null;
  ip_address: string | null;
  created_at: string;
  nama_pengguna: string | null;
  email_pengguna: string | null;
}

export interface FilterAktivitas {
  page?: number;
  limit?: number;
  aksi?: string;
  entitas?: string;
}
