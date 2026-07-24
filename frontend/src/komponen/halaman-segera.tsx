// Placeholder untuk halaman yang layout/route-nya sudah disiapkan pada tahap fondasi frontend,
// tetapi konten fiturnya baru dibangun pada tahap implementasi berikutnya (Prompt Master 8-9).
export function HalamanSegera({ judul }: { judul: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-surface p-8 text-center">
      <h1 className="text-xl font-semibold text-foreground">{judul}</h1>
      <p className="mt-2 text-sm text-inactive">
        Halaman ini akan diisi pada tahap implementasi berikutnya.
      </p>
    </div>
  );
}
