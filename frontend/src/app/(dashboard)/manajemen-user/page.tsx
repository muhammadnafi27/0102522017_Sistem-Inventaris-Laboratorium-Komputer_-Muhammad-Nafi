import type { Metadata } from "next";

import { AksesDitolak } from "@/komponen/akses-ditolak";
import { RoleGuard } from "@/komponen/role-guard";
import { IsiUser } from "@/fitur/user/isi-user";

export const metadata: Metadata = { title: "Manajemen User - LabInventory" };

export default function HalamanManajemenUser() {
  return (
    <RoleGuard roles={["admin"]} fallback={<AksesDitolak />}>
      <IsiUser />
    </RoleGuard>
  );
}
