"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Avatar } from "@/komponen/avatar";
import { BadgeRole } from "@/komponen/badge-role";
import { IkonKeluar, IkonMenuHamburger } from "@/komponen/ikon";
import { useAuth } from "@/konteks/auth-konteks";

interface PropsHeader {
  onBukaDrawerMobile: () => void;
}

export function Header({ onBukaDrawerMobile }: PropsHeader) {
  const { pengguna, logout } = useAuth();
  const router = useRouter();
  const [sedangKeluar, setSedangKeluar] = useState(false);

  // Logout memanggil backend untuk menghapus cookie JWT, membersihkan state pengguna di
  // AuthProvider, lalu mengarahkan kembali ke halaman login.
  async function tanganiLogout() {
    setSedangKeluar(true);
    await logout();
    router.replace("/login");
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-surface px-4 md:px-6">
      <button
        type="button"
        onClick={onBukaDrawerMobile}
        className="rounded-md p-2 text-inactive hover:bg-slate-100 md:hidden"
        aria-label="Buka menu navigasi"
      >
        <IkonMenuHamburger className="h-6 w-6" />
      </button>

      <div className="hidden md:block" />

      <div className="flex items-center gap-3">
        {pengguna && (
          <div className="hidden items-center gap-3 sm:flex">
            <div className="text-right">
              <p className="text-sm leading-tight font-medium text-foreground">{pengguna.nama}</p>
              <BadgeRole role={pengguna.role} />
            </div>
            <Avatar nama={pengguna.nama} />
          </div>
        )}

        <button
          type="button"
          onClick={tanganiLogout}
          disabled={sedangKeluar}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-delete transition-colors hover:bg-red-50 disabled:opacity-60"
        >
          <IkonKeluar className="h-5 w-5" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}
