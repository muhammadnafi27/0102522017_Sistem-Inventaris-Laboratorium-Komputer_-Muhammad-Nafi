interface PropsKolomForm {
  id: string;
  label: string;
  kesalahan?: string;
  children: React.ReactNode;
}

// Pembungkus label + input + pesan error per-field, dipakai konsisten oleh seluruh form
// (login, register, dan form domain lain pada tahap berikutnya).
export function KolomForm({ id, label, kesalahan, children }: PropsKolomForm) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {kesalahan && (
        <p className="text-xs text-delete" role="alert">
          {kesalahan}
        </p>
      )}
    </div>
  );
}

// Kelas Tailwind input teks standar - diekspor supaya input kustom (mis. InputPassword)
// tetap punya tampilan yang identik dengan input teks biasa.
// Ring fokus dibuat tebal dan kontras agar posisi kursor tetap jelas saat navigasi keyboard (Tab).
export const KELAS_INPUT_TEKS =
  "w-full rounded-lg border border-slate-300 bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/25 disabled:cursor-not-allowed disabled:bg-slate-50";

// Kelas tombol aksi utama (submit form, tombol tambah). Disatukan di sini supaya seluruh
// halaman memakai tinggi, radius, dan state fokus/disabled yang sama.
export const KELAS_TOMBOL_UTAMA =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-update focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
