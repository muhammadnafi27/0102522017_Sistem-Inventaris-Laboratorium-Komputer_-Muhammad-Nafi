import type { Metadata } from "next";

import { AksesDitolak } from "@/komponen/akses-ditolak";
import { HalamanSegera } from "@/komponen/halaman-segera";
import { RoleGuard } from "@/komponen/role-guard";

export const metadata: Metadata = { title: "Manajemen User - LabInventory" };

export default function HalamanManajemenUser() {
  return (
    <RoleGuard roles={["admin"]} fallback={<AksesDitolak />}>
      <HalamanSegera judul="Manajemen User" />
    </RoleGuard>
  );
}
