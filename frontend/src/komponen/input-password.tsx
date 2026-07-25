"use client";

import { useState } from "react";

import { KELAS_INPUT_TEKS } from "@/komponen/kolom-form";
import { IkonMata, IkonMataCoret } from "@/komponen/ikon";

interface PropsInputPassword {
  id: string;
  value: string;
  onChange: (nilai: string) => void;
  autoComplete?: string;
  placeholder?: string;
}

// Input password dengan tombol tampilkan/sembunyikan (show password) - dipakai form login
// dan register agar pengguna bisa memeriksa ketikan password sebelum submit.
export function InputPassword({ id, value, onChange, autoComplete, placeholder }: PropsInputPassword) {
  const [tampil, setTampil] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={tampil ? "text" : "password"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={`${KELAS_INPUT_TEKS} pr-11`}
      />
      <button
        type="button"
        onClick={() => setTampil((sebelumnya) => !sebelumnya)}
        className="absolute inset-y-0 right-0 flex items-center rounded-r-lg px-3 text-inactive transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        aria-label={tampil ? "Sembunyikan password" : "Tampilkan password"}
      >
        {tampil ? <IkonMataCoret className="h-5 w-5" /> : <IkonMata className="h-5 w-5" />}
      </button>
    </div>
  );
}
