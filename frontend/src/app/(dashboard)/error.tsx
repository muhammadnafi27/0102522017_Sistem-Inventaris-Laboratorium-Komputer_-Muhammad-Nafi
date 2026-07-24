"use client";

// Error boundary sederhana untuk seluruh route dashboard. File error.tsx adalah konvensi
// Next.js App Router - otomatis menangkap error yang dilempar saat render halaman di bawahnya.
export default function ErrorDashboard({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 p-8 text-center">
      <h1 className="text-lg font-semibold text-delete">Terjadi kesalahan saat memuat halaman.</h1>
      <p className="max-w-md text-sm text-delete/80">
        {error.message || "Silakan coba muat ulang halaman ini."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-update"
      >
        Coba Lagi
      </button>
    </div>
  );
}
