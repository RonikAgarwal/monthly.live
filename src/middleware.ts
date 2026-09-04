import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getGateGeneration } from '@/lib/gate';

// Redirect to the gate, marking the redirect with ?expired=1 when the visitor
// already had a session that is no longer valid (so the gate can say why).
function redirectToGate(request: NextRequest, expired: boolean) {
  const url = request.nextUrl.clone();
  url.pathname = '/gate';
  if (expired) url.searchParams.set('expired', '1');
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
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

  // The rest requires a cookie issued for the current gate session generation.
  // The generation is bumped whenever the site locks (e.g. on a password
  // change), which invalidates every older cookie and bounces those sessions
  // back to /gate.
  const authCookie = request.cookies.get('monthly-live-auth');

  if (!authCookie) {
    return redirectToGate(request, false);
  }

  if (authCookie.value === 'true') {
    // Sessions issued before the generation feature: treat as stale.
    return redirectToGate(request, true);
  }

  try {
    const expected = String(await getGateGeneration());
    if (authCookie.value === expected) {
      return NextResponse.next();
    }
  } catch {
    // Storage unavailable — treat as unauthenticated below.
  }

  return redirectToGate(request, true);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};