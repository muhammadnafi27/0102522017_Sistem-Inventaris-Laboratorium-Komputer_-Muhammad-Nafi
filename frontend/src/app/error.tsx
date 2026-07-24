"use client";

// Error boundary tingkat akar - menangkap error di luar route group (dashboard), mis. pada
// halaman login/register.
export default function ErrorAkar({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background p-8 text-center">
      <h1 className="text-lg font-semibold text-delete">Terjadi kesalahan pada aplikasi.</h1>
      <p className="max-w-md text-sm text-inactive">
        {error.message || "Silakan muat ulang halaman ini."}
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
