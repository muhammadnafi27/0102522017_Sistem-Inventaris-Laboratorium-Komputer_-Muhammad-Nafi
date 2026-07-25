import { IkonAktivitas, IkonCentang, IkonInventaris, type PropsIkon } from "@/komponen/ikon";

interface PropsLayoutAuth {
  judul: string;
  deskripsi: string;
  children: React.ReactNode;
}

// Sorotan fitur pada panel kiri. Isinya sengaja statis dan sama untuk login maupun register
// karena yang dijelaskan adalah produknya, bukan aksi halamannya.
const SOROTAN: { ikon: (props: PropsIkon) => React.ReactElement; judul: string; teks: string }[] = [
  {
    ikon: IkonInventaris,
    judul: "Pendataan Terpusat",
    teks: "Seluruh perangkat laboratorium tercatat lengkap dengan kode, kondisi, dan lokasi.",
  },
  {
    ikon: IkonCentang,
    judul: "Pantau Kondisi",
    teks: "Ketahui perangkat rusak atau perlu perawatan sebelum mengganggu praktikum.",
  },
  {
    ikon: IkonAktivitas,
    judul: "Jejak Audit",
    teks: "Setiap perubahan data tercatat lengkap dengan pelaku dan waktunya.",
  },
];

// Layout dua kolom untuk halaman login/register sesuai Gambar 1 PRD: panel branding biru
// di kiri (disembunyikan di layar kecil karena ruang horizontal tidak cukup untuk dua kolom),
// formulir putih di kanan.
export function LayoutAuth({ judul, deskripsi, children }: PropsLayoutAuth) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Panel branding. overflow-hidden menahan lingkaran dekoratif yang sengaja diposisikan
          melewati tepi panel agar tidak memunculkan scrollbar horizontal pada halaman. */}
      <div className="relative hidden overflow-hidden bg-navy lg:flex lg:w-[45%] lg:flex-col lg:justify-between lg:px-14 lg:py-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-primary/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-primary/20 blur-3xl"
        />

        <div className="relative flex items-center gap-3 text-white">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-base font-bold shadow-lg shadow-primary/40">
            LI
          </span>
          <div className="leading-tight">
            <p className="text-lg font-semibold">LabInventory</p>
            <p className="text-xs text-white/60">Sistem Inventaris Laboratorium</p>
          </div>
        </div>

        <div className="relative">
          <h1 className="max-w-md text-[2rem] leading-tight font-semibold text-white">{judul}</h1>
          <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-white/70">{deskripsi}</p>

          <ul className="mt-10 flex flex-col gap-5">
            {SOROTAN.map((item) => {
              const Ikon = item.ikon;
              return (
                <li key={item.judul} className="flex items-start gap-4">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white">
                    <Ikon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.judul}</p>
                    <p className="mt-0.5 max-w-xs text-sm leading-relaxed text-white/60">
                      {item.teks}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="relative text-xs text-white/40">
          Universitas Al-Azhar Indonesia &middot; Program Studi Informatika
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-background px-5 py-10 sm:px-8">
        <div className="w-full max-w-[26rem]">
          <div className="mb-7 flex items-center justify-center gap-2.5 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-sm font-bold text-white">
              LI
            </span>
            <span className="text-lg font-semibold text-foreground">LabInventory</span>
          </div>

          {/* Kartu putih bertujuan memisahkan formulir dari latar abu-abu halaman; pada layar
              kecil border/shadow dihilangkan supaya formulir terasa menyatu dengan layar. */}
          <div className="rounded-2xl bg-transparent p-0 sm:border sm:border-slate-200/80 sm:bg-surface sm:p-8 sm:shadow-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
