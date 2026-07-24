import type { ResultSetHeader } from "mysql2";
import type { PoolConnection } from "mysql2/promise";

import { pool } from "@/konfigurasi/database";
import type {
  BarangDenganKategoriRow,
  BarangRow,
  DistribusiKategoriRow,
  DistribusiKondisiRow,
  HitungRow,
  KondisiBarang,
} from "@/tipe/basis-data";

// Parameter pembuatan/perubahan barang.
export interface DataBarang {
  kode_barang: string;
  nama_barang: string;
  kategori_id: number;
  kondisi: KondisiBarang;
  lokasi: string;
  jumlah: number;
  foto: string | null;
}

// Kolom yang boleh dipakai untuk ORDER BY pada daftar barang. Whitelist ini mencegah
// SQL injection lewat parameter sort karena nama kolom tidak bisa memakai placeholder "?".
export const KOLOM_SORT_BARANG = [
  "kode_barang",
  "nama_barang",
  "kondisi",
  "lokasi",
  "jumlah",
  "created_at",
  "updated_at",
] as const;
export type KolomSortBarang = (typeof KOLOM_SORT_BARANG)[number];

export interface FilterBarang {
  search?: string;
  kategoriId?: number;
  kondisi?: KondisiBarang;
  lokasi?: string;
}

export interface OpsiDaftarBarang extends FilterBarang {
  halaman: number;
  batas: number;
  kolomSort: KolomSortBarang;
  arahSort: "ASC" | "DESC";
}

type Konektor = PoolConnection | typeof pool;

// Membangun klausa WHERE + nilai placeholder dari filter yang aktif saja; filter kosong
// tidak ditambahkan ke WHERE sesuai PRD 7.5. prefixKolom dipakai supaya kolom tidak ambigu
// ketika query melibatkan JOIN (mis. "b.kondisi" vs "kondisi" pada query tanpa JOIN).
function bangunKlausaWhere(
  filter: FilterBarang,
  prefixKolom = "",
): { where: string; nilai: (string | number)[] } {
  const klausa: string[] = [];
  const nilai: (string | number)[] = [];

  if (filter.search) {
    klausa.push(`(${prefixKolom}kode_barang LIKE ? OR ${prefixKolom}nama_barang LIKE ?)`);
    const kataKunci = `%${filter.search}%`;
    nilai.push(kataKunci, kataKunci);
  }
  if (filter.kategoriId) {
    klausa.push(`${prefixKolom}kategori_id = ?`);
    nilai.push(filter.kategoriId);
  }
  if (filter.kondisi) {
    klausa.push(`${prefixKolom}kondisi = ?`);
    nilai.push(filter.kondisi);
  }
  if (filter.lokasi) {
    klausa.push(`${prefixKolom}lokasi = ?`);
    nilai.push(filter.lokasi);
  }

  return { where: klausa.length > 0 ? `WHERE ${klausa.join(" AND ")}` : "", nilai };
}

export const barangRepository = {
  async cariSemua(konektor: Konektor = pool): Promise<BarangRow[]> {
    const [baris] = await konektor.execute<BarangRow[]>(
      "SELECT * FROM barang ORDER BY created_at DESC",
    );
    return baris;
  },

  // Daftar barang dengan search/filter/pagination/sort sekaligus nama kategori (JOIN) agar
  // frontend tidak perlu memanggil endpoint kategori terpisah untuk menampilkan tabel.
  async cariDenganFilter(
    opsi: OpsiDaftarBarang,
    konektor: Konektor = pool,
  ): Promise<BarangDenganKategoriRow[]> {
    const { where, nilai } = bangunKlausaWhere(opsi, "b.");
    // kolomSort/arahSort sudah divalidasi terhadap whitelist KOLOM_SORT_BARANG oleh
    // pemanggil (validasi + layanan) sebelum sampai di sini, sehingga aman diselipkan langsung.
    const offset = (opsi.halaman - 1) * opsi.batas;

    const [baris] = await konektor.execute<BarangDenganKategoriRow[]>(
      `SELECT b.*, k.nama_kategori
       FROM barang b
       JOIN kategori_barang k ON k.id = b.kategori_id
       ${where}
       ORDER BY b.${opsi.kolomSort} ${opsi.arahSort}
       LIMIT ? OFFSET ?`,
      [...nilai, opsi.batas, offset],
    );
    return baris;
  },

  async hitungDenganFilter(filter: FilterBarang, konektor: Konektor = pool): Promise<number> {
    const { where, nilai } = bangunKlausaWhere(filter);
    const [baris] = await konektor.execute<HitungRow[]>(
      `SELECT COUNT(*) AS total FROM barang ${where}`,
      nilai,
    );
    return Number(baris[0]?.total ?? 0);
  },

  // Daftar lokasi unik yang sedang dipakai barang, untuk mengisi opsi dropdown filter lokasi
  // pada halaman inventaris frontend (backend adalah satu-satunya sumber kebenaran lokasi).
  async cariDistinctLokasi(konektor: Konektor = pool): Promise<string[]> {
    const [baris] = await konektor.execute<HitungRow[]>(
      "SELECT DISTINCT lokasi FROM barang ORDER BY lokasi ASC",
    );
    // Baris hasil query hanya punya kolom "lokasi"; dipetakan ke array string sederhana.
    return (baris as unknown as { lokasi: string }[]).map((b) => b.lokasi);
  },

  // Jumlah barang per kondisi (Baik/Perlu Perawatan/Rusak/Tidak Aktif) untuk kartu
  // statistik dan grafik "Kondisi Barang" pada dashboard.
  async hitungPerKondisi(konektor: Konektor = pool): Promise<DistribusiKondisiRow[]> {
    const [baris] = await konektor.execute<DistribusiKondisiRow[]>(
      "SELECT kondisi, COUNT(*) AS total FROM barang GROUP BY kondisi",
    );
    return baris;
  },

  // Jumlah barang per kategori (LEFT JOIN agar kategori kosong tetap tampil dengan total 0)
  // untuk grafik "Distribusi Kategori" pada dashboard.
  async hitungPerKategori(konektor: Konektor = pool): Promise<DistribusiKategoriRow[]> {
    const [baris] = await konektor.execute<DistribusiKategoriRow[]>(
      `SELECT k.nama_kategori AS nama_kategori, COUNT(b.id) AS total
       FROM kategori_barang k
       LEFT JOIN barang b ON b.kategori_id = k.id
       GROUP BY k.id
       ORDER BY total DESC, k.nama_kategori ASC`,
    );
    return baris;
  },

  // Barang yang paling baru ditambahkan, untuk daftar "Barang Terbaru" pada dashboard.
  async cariTerbaru(batas: number, konektor: Konektor = pool): Promise<BarangDenganKategoriRow[]> {
    const [baris] = await konektor.execute<BarangDenganKategoriRow[]>(
      `SELECT b.*, k.nama_kategori
       FROM barang b
       JOIN kategori_barang k ON k.id = b.kategori_id
       ORDER BY b.created_at DESC
       LIMIT ?`,
      [batas],
    );
    return baris;
  },

  // Barang berkondisi Perlu Perawatan/Rusak, untuk daftar "Perlu Perhatian" pada dashboard.
  async cariPerluPerhatian(
    batas: number,
    konektor: Konektor = pool,
  ): Promise<BarangDenganKategoriRow[]> {
    const [baris] = await konektor.execute<BarangDenganKategoriRow[]>(
      `SELECT b.*, k.nama_kategori
       FROM barang b
       JOIN kategori_barang k ON k.id = b.kategori_id
       WHERE b.kondisi IN ('Perlu Perawatan', 'Rusak')
       ORDER BY b.updated_at DESC
       LIMIT ?`,
      [batas],
    );
    return baris;
  },

  async cariById(id: number, konektor: Konektor = pool): Promise<BarangRow | null> {
    const [baris] = await konektor.execute<BarangRow[]>("SELECT * FROM barang WHERE id = ? LIMIT 1", [
      id,
    ]);
    return baris[0] ?? null;
  },

  // Detail barang beserta nama kategori (JOIN) untuk halaman detail/GET satu barang.
  async cariByIdDenganKategori(
    id: number,
    konektor: Konektor = pool,
  ): Promise<BarangDenganKategoriRow | null> {
    const [baris] = await konektor.execute<BarangDenganKategoriRow[]>(
      `SELECT b.*, k.nama_kategori
       FROM barang b
       JOIN kategori_barang k ON k.id = b.kategori_id
       WHERE b.id = ?
       LIMIT 1`,
      [id],
    );
    return baris[0] ?? null;
  },

  // Dipakai untuk validasi kode_barang unik. kode_barang disimpan uppercase oleh service pemanggil.
  async cariByKode(kodeBarang: string, konektor: Konektor = pool): Promise<BarangRow | null> {
    const [baris] = await konektor.execute<BarangRow[]>(
      "SELECT * FROM barang WHERE kode_barang = ? LIMIT 1",
      [kodeBarang],
    );
    return baris[0] ?? null;
  },

  async hitungSemua(konektor: Konektor = pool): Promise<number> {
    const [baris] = await konektor.execute<HitungRow[]>("SELECT COUNT(*) AS total FROM barang");
    return Number(baris[0]?.total ?? 0);
  },

  async buat(data: DataBarang, konektor: Konektor = pool): Promise<number> {
    const [hasil] = await konektor.execute<ResultSetHeader>(
      `INSERT INTO barang (kode_barang, nama_barang, kategori_id, kondisi, lokasi, jumlah, foto)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        data.kode_barang,
        data.nama_barang,
        data.kategori_id,
        data.kondisi,
        data.lokasi,
        data.jumlah,
        data.foto,
      ],
    );
    return hasil.insertId;
  },

  async perbarui(id: number, data: DataBarang, konektor: Konektor = pool): Promise<boolean> {
    const [hasil] = await konektor.execute<ResultSetHeader>(
      `UPDATE barang
       SET kode_barang = ?, nama_barang = ?, kategori_id = ?, kondisi = ?, lokasi = ?, jumlah = ?, foto = ?
       WHERE id = ?`,
      [
        data.kode_barang,
        data.nama_barang,
        data.kategori_id,
        data.kondisi,
        data.lokasi,
        data.jumlah,
        data.foto,
        id,
      ],
    );
    return hasil.affectedRows > 0;
  },

  async hapus(id: number, konektor: Konektor = pool): Promise<boolean> {
    const [hasil] = await konektor.execute<ResultSetHeader>("DELETE FROM barang WHERE id = ?", [id]);
    return hasil.affectedRows > 0;
  },
};
