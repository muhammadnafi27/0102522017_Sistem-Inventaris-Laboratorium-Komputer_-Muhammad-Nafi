// Membangun query string dari objek parameter, melewati nilai kosong (undefined/null/"")
// agar filter yang tidak diisi tidak ikut terkirim ke backend - konsisten dengan aturan
// backend "filter kosong tidak ditambahkan ke WHERE" (PRD 7.5).
export function bangunQueryString(
  params?: Record<string, string | number | boolean | undefined | null>,
): string {
  if (!params) {
    return "";
  }

  const usp = new URLSearchParams();
  for (const [kunci, nilai] of Object.entries(params)) {
    if (nilai === undefined || nilai === null || nilai === "") {
      continue;
    }
    usp.set(kunci, String(nilai));
  }

  const hasil = usp.toString();
  return hasil ? `?${hasil}` : "";
}
