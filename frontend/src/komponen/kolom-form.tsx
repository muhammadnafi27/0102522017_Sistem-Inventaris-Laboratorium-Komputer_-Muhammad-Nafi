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
export const KELAS_INPUT_TEKS =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";
