import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token_akses')?.value;

  // Lindungi area dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/masuk', request.url));
    }
  }

  // Jika sudah login, jangan biarkan masuk ke halaman login/register
  if (request.nextUrl.pathname === '/masuk' || request.nextUrl.pathname === '/daftar') {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/masuk', '/daftar'],
};
