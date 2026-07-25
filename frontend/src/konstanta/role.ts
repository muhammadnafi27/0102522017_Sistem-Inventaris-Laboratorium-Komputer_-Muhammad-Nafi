import type { RolePengguna } from "@/tipe/pengguna";

export const OPSI_ROLE: RolePengguna[] = ["admin", "operator", "viewer"];

export const LABEL_ROLE: Record<RolePengguna, string> = {
  admin: "Admin",
  operator: "Operator",
  viewer: "Viewer",
};
