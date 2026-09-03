import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;
    
    // Fall back to 'admin' when no env password is configured, so the gate
    // never silently accepts any password.
    const expected = process.env.SITE_ACCESS_PASSWORD || 'admin';
    
    // Constant time string comparison
    const encoder = new TextEncoder();
    const a = encoder.encode(password || '');
    const b = encoder.encode(expected);
    
    let success = false;
    
    if (a.length === b.length && a.length > 0) {
      let result = 0;
      for (let i = 0; i < a.length; i++) {
        result |= a[i] ^ b[i];
      }
      success = (result === 0);
    }
    
    if (success) {
      const response = NextResponse.json({ success: true });
      response.cookies.set({
        name: 'monthly-live-auth',
        value: 'true',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
      return response;
    }
    
    return NextResponse.json({ success: false }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
