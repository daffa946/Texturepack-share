import { NextResponse } from 'next/server';

// The upload page only exists on the hidden admin host (ADMIN_HOST).
// On every other host (the public one embedded in Google Sites) /upload is a 404.
export function middleware(req) {
  const host = (req.headers.get('host') || '').toLowerCase();
  const admin = (process.env.ADMIN_HOST || '').toLowerCase().trim();
  const path = req.nextUrl.pathname;
  if (!admin) return NextResponse.next(); // not configured yet: /upload works everywhere
  const isAdmin = host === admin;
  if (isAdmin && path === '/') return NextResponse.rewrite(new URL('/upload', req.url));
  if (!isAdmin && path.startsWith('/upload')) return new NextResponse('Not found', { status: 404 });
  return NextResponse.next();
}

export const config = { matcher: ['/', '/upload'] };
