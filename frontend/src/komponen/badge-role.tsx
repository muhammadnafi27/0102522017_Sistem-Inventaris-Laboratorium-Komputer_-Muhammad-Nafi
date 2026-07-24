import type { RolePengguna } from "@/tipe/pengguna";

const LABEL_ROLE: Record<RolePengguna, string> = {
  admin: "Admin",
  operator: "Operator",
  viewer: "Viewer",
};

// Warna badge role mengikuti token PRD 4.1: navy untuk admin, primary untuk operator,
// abu-abu (inactive) untuk viewer.
const KELAS_WARNA_ROLE: Record<RolePengguna, string> = {
  admin: "bg-navy text-white",
  operator: "bg-primary/10 text-primary",
  viewer: "bg-slate-100 text-inactive",
};

export function BadgeRole({ role }: { role: RolePengguna }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${KELAS_WARNA_ROLE[role]}`}
    >
      {LABEL_ROLE[role]}
    </span>
  );
}
