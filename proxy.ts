import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, signToken } from '@/lib/auth';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect logged-in users away from auth pages
  if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) {
    const token = request.cookies.get('token')?.value;
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        return NextResponse.redirect(new URL('/projects', request.url));
      }
    }
    return NextResponse.next();
  }

  // Only protect dashboard routes
  if (!pathname.startsWith('/projects') && pathname !== '/') {
    return NextResponse.next();
  }

  // Root path redirect to projects
  if (pathname === '/') {
    const token = request.cookies.get('token')?.value;
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        return NextResponse.redirect(new URL('/projects', request.url));
      }
    }
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  const token = request.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  const payload = verifyToken(token);
  if (!payload) {
    const response = NextResponse.redirect(new URL('/sign-in', request.url));
    response.cookies.delete('token');
    return response;
  }

  // Sliding session: refresh token on every authenticated request
  const response = NextResponse.next();
  const newToken = signToken({ userId: payload.userId });
  response.cookies.set('token', newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  // Prevent browser from caching protected pages
  response.headers.set(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate'
  );
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  // Pass userId to downstream handlers
  response.headers.set('x-user-id', payload.userId);
  return response;
}

export const config = {
  matcher: ['/', '/projects/:path*', '/sign-in', '/sign-up'],
};
