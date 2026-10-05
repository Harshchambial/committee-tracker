import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

const PUBLIC_API_PATHS = new Set([
  '/api/auth/login',
  '/api/auth/logout',
  '/api/health'
]);

export function proxy(request: NextRequest) {
  if (PUBLIC_API_PATHS.has(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  if (!getSession(request)) {
    return NextResponse.json(
      { error: 'Authentication required. Please sign in again.' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*']
};
