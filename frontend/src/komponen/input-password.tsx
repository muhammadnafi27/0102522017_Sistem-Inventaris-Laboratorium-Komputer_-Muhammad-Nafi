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
        className={`${KELAS_INPUT_TEKS} pr-10`}
      />
      <button
        type="button"
        onClick={() => setTampil((sebelumnya) => !sebelumnya)}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-inactive hover:text-foreground"
        aria-label={tampil ? "Sembunyikan password" : "Tampilkan password"}
      >
        {tampil ? <IkonMataCoret className="h-4 w-4" /> : <IkonMata className="h-4 w-4" />}
      </button>
    </div>
  );
}
