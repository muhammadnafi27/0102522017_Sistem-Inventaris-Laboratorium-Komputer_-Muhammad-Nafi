interface PropsLayoutAuth {
  judul: string;
  deskripsi: string;
  children: React.ReactNode;
}

// Layout dua kolom untuk halaman login/register sesuai Gambar 1 PRD: panel branding biru
// di kiri (disembunyikan di layar kecil), formulir putih di kanan.
export function LayoutAuth({ judul, deskripsi, children }: PropsLayoutAuth) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div className="hidden flex-col justify-center gap-8 bg-navy px-12 py-16 text-white md:flex md:w-1/2">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-sm font-bold">
          LI
        </span>
        <div>
          <h1 className="text-3xl leading-tight font-semibold">{judul}</h1>
          <p className="mt-4 max-w-sm text-white/80">{deskripsi}</p>
        </div>
        <div
          className="mt-4 h-56 rounded-xl border border-white/10 bg-white/5"
          aria-hidden="true"
        />
      </div>

      <div className="flex flex-1 items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex items-center gap-2 md:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-navy text-sm font-bold text-white">
              LI
            </span>
            <span className="text-lg font-semibold text-foreground">LabInventory</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
