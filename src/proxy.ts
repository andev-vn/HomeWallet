import { NextResponse, type NextRequest } from 'next/server';

const COOKIE = 'vn_session';
const PROTECTED = ['/home', '/expenses', '/add', '/profile', '/settings', '/invite'];
const AUTH_PAGES = ['/login', '/register'];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = Boolean(req.cookies.get(COOKIE)?.value);

  if (!hasSession && PROTECTED.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (hasSession && AUTH_PAGES.includes(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = '/home';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/home/:path*', '/expenses/:path*', '/add/:path*', '/profile/:path*', '/settings/:path*', '/invite/:path*', '/login', '/register'],
};
