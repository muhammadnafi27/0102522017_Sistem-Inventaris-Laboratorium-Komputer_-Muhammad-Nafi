// Loading skeleton generik dipakai saat AuthProvider masih memeriksa sesi (/auth/me) atau
// saat route segment lain menunggu data. Skeleton spesifik per fitur (tabel, kartu) menyusul
// pada tahap implementasi halaman masing-masing.
export function SkeletonHalaman() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"
        aria-hidden="true"
      />
      <p className="text-sm text-inactive">Memuat...</p>
    </div>
  );
}
