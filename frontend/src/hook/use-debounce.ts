"use client";

import { useEffect, useState } from "react";

// Menunda pembaruan sebuah nilai selama `jeda` ms sejak perubahan terakhir. Dipakai pada
// input search agar tidak memanggil API pada setiap ketikan (PRD: debounce 300-500 ms).
export function useDebounce<T>(nilai: T, jeda = 400): T {
  const [nilaiTertunda, setNilaiTertunda] = useState(nilai);

  useEffect(() => {
    const timer = setTimeout(() => setNilaiTertunda(nilai), jeda);
    return () => clearTimeout(timer);
  }, [nilai, jeda]);

  return nilaiTertunda;
}
