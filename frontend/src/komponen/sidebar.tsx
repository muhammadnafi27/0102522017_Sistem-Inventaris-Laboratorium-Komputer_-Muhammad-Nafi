"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { IkonPanelCiutkan, IkonPanelPerluas } from "@/komponen/ikon";
import { DAFTAR_MENU } from "@/konstanta/menu";
import { useAuth } from "@/konteks/auth-konteks";

interface PropsSidebar {
  tertutup: boolean;
  onToggleTertutup: () => void;
  drawerMobileTerbuka: boolean;
  onTutupDrawerMobile: () => void;
}

// Sidebar navy yang dapat diciutkan (mode ikon saja) di desktop, dan menjadi drawer overlay
// di layar kecil. Menu difilter berdasarkan role pengguna aktif - item yang tidak diizinkan
// tidak ditampilkan sama sekali (bukan sekadar disembunyikan lewat CSS).
export function Sidebar({
  tertutup,
  onToggleTertutup,
  drawerMobileTerbuka,
  onTutupDrawerMobile,
}: PropsSidebar) {
  const pathname = usePathname();
  const { pengguna } = useAuth();

  // Drawer mobile dapat ditutup dengan tombol Escape sesuai spesifikasi PRD 4.2.
  useEffect(() => {
    if (!drawerMobileTerbuka) return;

    function tanganiTombol(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onTutupDrawerMobile();
      }
    }

    document.addEventListener("keydown", tanganiTombol);
    return () => document.removeEventListener("keydown", tanganiTombol);
  }, [drawerMobileTerbuka, onTutupDrawerMobile]);

  const menuTerlihat = pengguna
    ? DAFTAR_MENU.filter((item) => item.rolesDiizinkan.includes(pengguna.role))
    : [];

  return (
    <>
      {/* Backdrop drawer mobile - klik di luar sidebar menutup drawer (PRD 4.2). */}
      {drawerMobileTerbuka && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onTutupDrawerMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-navy text-white",
          "transition-[transform,width] duration-200 ease-in-out",
          "md:static md:translate-x-0",
          tertutup ? "md:w-20" : "md:w-64",
          drawerMobileTerbuka ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        aria-label="Navigasi utama"
      >
        <div className="flex h-16 items-center gap-2 border-b border-white/10 px-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-bold">
            LI
          </span>
          {!tertutup && <span className="text-lg font-semibold whitespace-nowrap">LabInventory</span>}
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          <ul className="flex flex-col gap-1 px-2">
            {menuTerlihat.map((item) => {
              const aktif = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onTutupDrawerMobile}
                    aria-current={aktif ? "page" : undefined}
                    // Label teks disembunyikan saat sidebar diciutkan, jadi aria-label selalu
                    // disertakan agar nama tautan tetap terbaca screen reader; title memberi
                    // tooltip yang setara untuk pengguna mouse.
                    aria-label={item.label}
                    title={tertutup ? item.label : undefined}
                    className={[
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
                      tertutup ? "md:justify-center" : "",
                      aktif ? "bg-primary text-white" : "text-white/80 hover:bg-white/10 hover:text-white",
                    ].join(" ")}
                  >
                    <item.Ikon className="h-5 w-5 shrink-0" />
                    <span className={tertutup ? "md:hidden" : ""}>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          type="button"
          onClick={onToggleTertutup}
          aria-label={tertutup ? "Perluas sidebar" : "Ciutkan sidebar"}
          className="hidden items-center gap-2 border-t border-white/10 px-4 py-3 text-sm text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70 md:flex"
        >
          {tertutup ? <IkonPanelPerluas className="h-5 w-5" /> : <IkonPanelCiutkan className="h-5 w-5" />}
          {!tertutup && <span>Ciutkan Sidebar</span>}
        </button>
      </aside>
    </>
  );
}
