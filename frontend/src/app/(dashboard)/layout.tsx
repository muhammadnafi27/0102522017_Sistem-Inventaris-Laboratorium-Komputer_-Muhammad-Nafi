"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { DashboardShell } from "@/komponen/tata-letak/dashboard-shell";
import { SkeletonHalaman } from "@/komponen/skeleton-halaman";
import { useAuth } from "@/konteks/auth-konteks";

// Layout terproteksi untuk seluruh halaman dashboard (route group (dashboard)). Selama status
// login belum diketahui (memuat), tampilkan skeleton. Setelah diketahui, pengguna yang belum
// login diarahkan ke /login; pengguna yang sudah login melihat shell sidebar+header.
export default function LayoutDashboard({ children }: { children: React.ReactNode }) {
  const { pengguna, memuat } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!memuat && !pengguna) {
      router.replace("/login");
    }
  }, [memuat, pengguna, router]);

  if (memuat || !pengguna) {
    return <SkeletonHalaman />;
  }

  return <DashboardShell>{children}</DashboardShell>;
}
