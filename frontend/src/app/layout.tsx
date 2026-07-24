import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/konteks/auth-konteks";

// Font Inter dipakai konsisten di seluruh aplikasi sesuai spesifikasi UI/UX pada PRD.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LabInventory - Sistem Inventaris Laboratorium Komputer",
  description:
    "Aplikasi pengelolaan inventaris laboratorium komputer dengan autentikasi role admin, operator, dan viewer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
