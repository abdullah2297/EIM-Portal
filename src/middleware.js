import { NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';

/**
 * Guards the admin panel.
 *
 * Unauthenticated requests to any `/admin/*` page (except the login screen)
 * are redirected to `/admin/login`, carrying a `next` parameter so the user
 * lands back where they were heading after signing in. Already-authenticated
 * users who open the login screen are bounced to the dashboard.
 *
 * The API routes enforce the same rule independently (see `requireAdmin`), so
 * the middleware is a convenience layer, not the only line of defence.
 */
export async function middleware(request) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  const isLoginPage = pathname === '/admin/login';

  if (!session && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (session && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
