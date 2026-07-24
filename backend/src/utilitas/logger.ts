// Logger sederhana terpusat. Cukup untuk kebutuhan proyek satu minggu tanpa menambah dependency baru.
// Log error selalu ditulis; log info hanya pada mode development agar output produksi tetap bersih.
export const logger = {
  info: (pesan: string, meta?: unknown): void => {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[INFO] ${pesan}`, meta ?? "");
    }
  },
  error: (pesan: string, error?: unknown): void => {
    console.error(`[ERROR] ${pesan}`, error ?? "");
  },
};
