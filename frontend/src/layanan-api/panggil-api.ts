const URL_API = process.env.NEXT_PUBLIC_URL_API || 'http://localhost:3000/api';

/**
 * Helper untuk memanggil API backend dengan menyertakan credentials (cookie JWT).
 */
export async function panggilApi<T>(jalur: string, opsi: RequestInit = {}): Promise<T> {
  const isFormData = opsi.body instanceof FormData;
  
  const respons = await fetch(`${URL_API}${jalur}`, {
    ...opsi,
    credentials: 'include', // Penting agar cookie dikirim
    headers: {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...opsi.headers,
    },
  });

  const hasil = await respons.json();
  
  if (!respons.ok) {
    throw new Error(hasil.pesan || "Permintaan gagal");
  }
  
  return hasil;
}
