// Ditampilkan oleh RoleGuard saat role pengguna tidak diizinkan membuka suatu halaman -
// termasuk saat URL dibuka manual tanpa lewat menu sidebar (menu yang tidak relevan
// disembunyikan, tetapi route tetap harus ditolak jika diakses langsung).
export function AksesDitolak() {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
      <h1 className="text-xl font-semibold text-delete">403 - Akses Ditolak</h1>
      <p className="mt-2 text-sm text-delete/80">
        Anda tidak memiliki hak akses untuk membuka halaman ini.
      </p>
    </div>
  );
}
