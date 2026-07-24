"use client";

import { useRouter } from "next/navigation";

import { IkonCentang, IkonKategori, IkonKotakStat, IkonPeringatan, type PropsIkon } from "@/komponen/ikon";

interface KonfigKartu {
  label: string;
  nilai: number;
  keterangan: string;
  Ikon: (props: PropsIkon) => React.ReactElement;
  // Gradien untuk chip ikon dan blob dekoratif; warna bayangan halus senada dengan tema kartu.
  gradien: string;
  bayangan: string;
  aksenTeks: string;
  // Tujuan navigasi saat kartu diklik (mengarah ke inventaris dengan filter terkait).
  href: string;
}

interface PropsKartuStatistik {
  totalBarang: number;
  totalKategori: number;
  kondisiBaik: number;
  perluPerhatian: number;
}

// Empat kartu ringkasan di atas dashboard. Setiap kartu dapat diklik untuk menuju halaman
// inventaris dengan filter yang sesuai (PRD: klik kartu mengarah ke inventaris dengan filter).
export function KartuStatistik({
  totalBarang,
  totalKategori,
  kondisiBaik,
  perluPerhatian,
}: PropsKartuStatistik) {
  const router = useRouter();

  const kartu: KonfigKartu[] = [
    {
      label: "Total Barang",
      nilai: totalBarang,
      keterangan: "Jumlah SKU terdaftar",
      Ikon: IkonKotakStat,
      gradien: "from-primary to-update",
      bayangan: "shadow-primary/30",
      aksenTeks: "text-primary",
      href: "/inventaris-barang",
    },
    {
      label: "Total Kategori",
      nilai: totalKategori,
      keterangan: "Kategori aktif",
      Ikon: IkonKategori,
      gradien: "from-[#1c6fb0] to-navy",
      bayangan: "shadow-navy/30",
      aksenTeks: "text-navy",
      href: "/kategori-barang",
    },
    {
      label: "Kondisi Baik",
      nilai: kondisiBaik,
      keterangan: "Siap digunakan",
      Ikon: IkonCentang,
      gradien: "from-emerald-400 to-success",
      bayangan: "shadow-emerald-500/30",
      aksenTeks: "text-success",
      href: "/inventaris-barang?kondisi=Baik",
    },
    {
      label: "Perlu Perhatian",
      nilai: perluPerhatian,
      keterangan: "Perawatan atau rusak",
      Ikon: IkonPeringatan,
      gradien: "from-amber-400 to-warning",
      bayangan: "shadow-amber-500/30",
      aksenTeks: "text-warning",
      href: "/inventaris-barang?kondisi=Perlu%20Perawatan",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {kartu.map((k) => (
        <button
          key={k.label}
          type="button"
          onClick={() => router.push(k.href)}
          className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-surface p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lg"
        >
          {/* Blob gradien dekoratif di sudut - memberi kedalaman lembut tanpa mengganggu keterbacaan. */}
          <div
            className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${k.gradien} opacity-10 blur-2xl transition-opacity duration-200 group-hover:opacity-20`}
          />

          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-inactive">{k.label}</p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-foreground tabular-nums">
                {k.nilai}
              </p>
            </div>
            <span
              className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${k.gradien} text-white shadow-lg ${k.bayangan} transition-transform duration-200 group-hover:scale-105`}
            >
              <k.Ikon className="h-6 w-6" />
            </span>
          </div>

          <p className="relative mt-3 text-xs text-inactive">{k.keterangan}</p>
        </button>
      ))}
    </div>
  );
}
