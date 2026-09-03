import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/assets') ||
    pathname.startsWith('/api/stream') ||
    pathname.startsWith('/api/heartbeat') ||
    pathname === '/gate' ||
    pathname === '/api/gate' ||
    pathname === '/adminpw' ||
    pathname === '/api/adminpw' ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // The rest requires the cookie
  const authCookie = request.cookies.get('monthly-live-auth');
  if (!authCookie || authCookie.value !== 'true') {
    const url = request.nextUrl.clone();
    url.pathname = '/gate';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
