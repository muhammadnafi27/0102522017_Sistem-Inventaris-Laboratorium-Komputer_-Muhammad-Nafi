"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { SkeletonHalaman } from "@/komponen/skeleton-halaman";
import { useAuth } from "@/konteks/auth-konteks";

// Halaman akar hanya bertugas mengarahkan: sudah login -> /dashboard, belum login -> /login.
// Tidak ada konten yang dirender di sini selain skeleton selagi status sesi diperiksa.
export default function HalamanBeranda() {
  const { pengguna, memuat } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (memuat) return;
    router.replace(pengguna ? "/dashboard" : "/login");
  }, [memuat, pengguna, router]);

  return <SkeletonHalaman />;
}
