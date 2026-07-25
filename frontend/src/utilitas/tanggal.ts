// Memformat string tanggal dari database ("YYYY-MM-DD HH:mm:ss") menjadi teks Indonesia
// yang mudah dibaca, mis. "25 Juli 2026". Mengembalikan "-" bila input kosong/invalid.
export function formatTanggal(nilai: string | null | undefined): string {
  if (!nilai) return "-";
  const tanggal = new Date(nilai.replace(" ", "T"));
  if (Number.isNaN(tanggal.getTime())) return "-";
  return tanggal.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

// Memformat tanggal + jam, dipakai untuk log Aktivitas Sistem yang butuh presisi waktu
// (bukan hanya tanggal), mis. "25 Juli 2026, 14.30".
export function formatWaktu(nilai: string | null | undefined): string {
  if (!nilai) return "-";
  const tanggal = new Date(nilai.replace(" ", "T"));
  if (Number.isNaN(tanggal.getTime())) return "-";
  const tgl = tanggal.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  const jam = tanggal.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  return `${tgl}, ${jam}`;
}

// Salam berdasarkan jam lokal untuk sapaan dashboard (Pagi/Siang/Sore/Malam).
export function salamWaktu(): string {
  const jam = new Date().getHours();
  if (jam < 11) return "Selamat Pagi";
  if (jam < 15) return "Selamat Siang";
  if (jam < 19) return "Selamat Sore";
  return "Selamat Malam";
}
