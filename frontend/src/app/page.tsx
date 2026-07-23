import { redirect } from 'next/navigation';

export default function Home() {
  // Halaman root langsung diarahkan ke dashboard
  // Middleware akan menangani apakah harus ke /masuk atau dilanjutkan ke /dashboard
  redirect('/dashboard');
}
