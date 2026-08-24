import { NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';
import { EMPLOYEE_SESSION_COOKIE, verifyEmployeeSessionToken } from '@/lib/employeeAuth';
import { resolveSectionForPath } from '@/lib/siteSections';
import { readCollection } from '@/lib/db';

/**
 * Guards both the admin panel and the public site.
 *
 * Admin: unauthenticated requests to any `/admin/*` page (except the login
 * screen) redirect to `/admin/login`, carrying a `next` parameter. Already-
 * authenticated visits to the login screen bounce to the dashboard. This half
 * is unchanged from before.
 *
 * Public site: every other page except `/` itself requires an employee
 * session - `/` is the one page that stays reachable while logged out, so it
 * can render the trimmed anonymous landing view instead of nothing at all.
 * There is no separate `/login` page; the login form lives inline in the
 * header, reachable from `/`. Beyond just being logged in, a path that maps
 * to a gated section (see `siteSections.js`) also requires that section to be
 * in the employee's *current* granted list, looked up live from
 * `employee-credentials` on every request - not cached in the token - so an
 * admin resetting an account or changing its permissions takes effect
 * immediately, including for a session issued before the change.
 *
 * The API routes enforce their own rules independently (`requireAdmin`,
 * `requireEmployee`), so this middleware is a convenience layer for pages,
 * not the only line of defence.
 */
export async function middleware(request) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
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

  if (pathname !== '/') {
    const permitted = await isEmployeePermitted(request, pathname);

    if (!permitted) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.search = `?next=${encodeURIComponent(pathname + search)}`;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

/** Verifies the session token, then checks the *live* credential row for the requested section. */
async function isEmployeePermitted(request, pathname) {
  const token = request.cookies.get(EMPLOYEE_SESSION_COOKIE)?.value;
  const session = await verifyEmployeeSessionToken(token);
  if (!session) return false;

  let credentials;
  try {
    credentials = await readCollection('employee-credentials');
  } catch {
    return false;
  }
  const credential = (Array.isArray(credentials) ? credentials : []).find(
    (item) => item.employeeId === session.sub,
  );
  if (!credential) return false;

  const section = resolveSectionForPath(pathname);
  if (!section) return true;
  return Array.isArray(credential.sections) && credential.sections.includes(section);
}

export const config = {
  // Everything except API routes, Next internals and static files (any path
  // with an extension) - covers both the `/admin/*` and public-site branches.
  matcher: ['/((?!api|_next|.*\\.).*)'],
};
