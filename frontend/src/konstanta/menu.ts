import {
  IkonAktivitas,
  IkonDashboard,
  IkonInventaris,
  IkonKategori,
  IkonProfil,
  IkonUser,
  type PropsIkon,
} from "@/komponen/ikon";
import type { RolePengguna } from "@/tipe/pengguna";

export interface ItemMenu {
  label: string;
  href: string;
  Ikon: (props: PropsIkon) => React.ReactElement;
  rolesDiizinkan: RolePengguna[];
}

// Menu Aktivitas Sistem dibatasi admin saja - konsisten dengan backend (GET /api/aktivitas
// hanya authorizeRoles("admin"), lihat backend/src/rute/aktivitas.rute.ts). Menu Kategori Barang
// tidak ditampilkan untuk viewer karena viewer memang tidak memiliki akses ke domain kategori.
export const DAFTAR_MENU: ItemMenu[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    Ikon: IkonDashboard,
    rolesDiizinkan: ["admin", "operator", "viewer"],
  },
  {
    label: "Inventaris Barang",
    href: "/inventaris-barang",
    Ikon: IkonInventaris,
    rolesDiizinkan: ["admin", "operator", "viewer"],
  },
  {
    label: "Kategori Barang",
    href: "/kategori-barang",
    Ikon: IkonKategori,
    rolesDiizinkan: ["admin", "operator"],
  },
  {
    label: "Manajemen User",
    href: "/manajemen-user",
    Ikon: IkonUser,
    rolesDiizinkan: ["admin"],
  },
  {
    label: "Aktivitas Sistem",
    href: "/aktivitas-sistem",
    Ikon: IkonAktivitas,
    rolesDiizinkan: ["admin"],
  },
  {
    label: "Profil",
    href: "/profil",
    Ikon: IkonProfil,
    rolesDiizinkan: ["admin", "operator", "viewer"],
  },
];
