"use client";

interface PropsDistribusiKategori {
  data: { kategori: string; total: number }[];
}

// Grafik batang horizontal "Distribusi Kategori". Lebar bar relatif terhadap kategori
// dengan jumlah barang terbanyak agar perbandingan antar kategori mudah dibaca.
export function DistribusiKategori({ data }: PropsDistribusiKategori) {
  const maksimum = data.reduce((maks, d) => Math.max(maks, d.total), 0);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-surface p-5 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-foreground">Distribusi Kategori</h2>
      <div className="flex flex-col gap-4">
        {data.map((d) => {
          const persen = maksimum === 0 ? 0 : Math.round((d.total / maksimum) * 100);
          return (
            <div key={d.kategori}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="text-foreground">{d.kategori}</span>
                <span className="font-semibold text-foreground tabular-nums">{d.total}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-update transition-all duration-500"
                  style={{ width: `${persen}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
