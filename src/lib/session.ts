import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';
import type { NextResponse } from 'next/server';
import type { UserRole } from '@/types';

const COOKIE_NAME = process.env.NODE_ENV === 'production'
  ? '__Host-samiti_session'
  : 'samiti_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export interface SessionPayload {
  sub: string;
  name: string;
  role: UserRole;
  exp: number;
}

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SESSION_SECRET must be configured with at least 32 characters.');
    }
    return 'local-development-only-session-secret-change-me';
  }
  return secret;
}

function sign(encodedPayload: string): string {
  return createHmac('sha256', getSessionSecret())
    .update(encodedPayload)
    .digest('base64url');
}

export function createSessionToken(
  user: Omit<SessionPayload, 'exp'>,
  nowSeconds = Math.floor(Date.now() / 1000)
): string {
  const payload: SessionPayload = {
    ...user,
    exp: nowSeconds + SESSION_TTL_SECONDS
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifySessionToken(token?: string | null): SessionPayload | null {
  if (!token) return null;

  try {
    const [encodedPayload, receivedSignature, extra] = token.split('.');
    if (!encodedPayload || !receivedSignature || extra) return null;

    const expectedSignature = sign(encodedPayload);
    const received = Buffer.from(receivedSignature);
    const expected = Buffer.from(expectedSignature);
    if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as SessionPayload;
    if (!payload.sub || !payload.name || !payload.role || !payload.exp) return null;
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function readCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(';')) {
    const [cookieName, ...valueParts] = part.trim().split('=');
    if (cookieName === name) return decodeURIComponent(valueParts.join('='));
  }
  return null;
}

export function getSession(request: Request): SessionPayload | null {
  return verifySessionToken(readCookie(request, COOKIE_NAME));
}

export function isAdminSession(session: SessionPayload | null): boolean {
  return Boolean(session && ['ADMIN', 'CO_ADMIN', 'SUPER_ADMIN'].includes(session.role));
}

export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
    priority: 'high'
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0
  });
}
