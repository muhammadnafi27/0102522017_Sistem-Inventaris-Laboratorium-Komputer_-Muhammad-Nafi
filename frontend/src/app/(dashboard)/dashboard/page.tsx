import type { Metadata } from "next";

import { IsiDashboard } from "@/fitur/dashboard/isi-dashboard";

export const metadata: Metadata = { title: "Dashboard - LabInventory" };

export default function HalamanDashboard() {
  return <IsiDashboard />;
}
