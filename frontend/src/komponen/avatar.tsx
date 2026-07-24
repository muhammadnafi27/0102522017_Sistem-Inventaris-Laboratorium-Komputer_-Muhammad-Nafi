interface PropsAvatar {
  nama: string;
}

// Avatar inisial sederhana (dua huruf pertama dari maksimal dua kata nama) - tidak memakai
// foto profil karena PRD tidak meminta fitur upload foto akun.
export function Avatar({ nama }: PropsAvatar) {
  const inisial =
    nama
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((kata) => kata[0])
      .join("")
      .toUpperCase() || "?";

  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-semibold text-white"
      aria-hidden="true"
    >
      {inisial}
    </div>
  );
}
