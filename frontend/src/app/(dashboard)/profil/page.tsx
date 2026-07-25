import type { Metadata } from "next";

import { IsiProfil } from "@/fitur/profil/isi-profil";

export const metadata: Metadata = { title: "Profil - LabInventory" };

export default function HalamanProfil() {
  return <IsiProfil />;
}
