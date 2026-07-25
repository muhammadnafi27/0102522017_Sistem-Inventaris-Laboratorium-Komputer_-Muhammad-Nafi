import type { Metadata } from "next";

import { AksesDitolak } from "@/komponen/akses-ditolak";
import { RoleGuard } from "@/komponen/role-guard";
import { IsiAktivitas } from "@/fitur/aktivitas/isi-aktivitas";

export const metadata: Metadata = { title: "Aktivitas Sistem - LabInventory" };

// Dibatasi admin saja - konsisten dengan backend (GET /api/aktivitas authorizeRoles("admin")).
// PRD menyebut operator BOLEH melihat read-only "hanya bila backend mengizinkan" - backend
// LabInventory tidak mengizinkan operator pada endpoint ini, sehingga menu disembunyikan untuk
// operator (lihat konstanta/menu.ts) dan URL langsung menampilkan 403 bila dibuka manual.
export default function HalamanAktivitasSistem() {
  return (
    <RoleGuard roles={["admin"]} fallback={<AksesDitolak />}>
      <IsiAktivitas />
    </RoleGuard>
  );
}
