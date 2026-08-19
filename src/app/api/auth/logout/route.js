import { cookies } from 'next/headers';
import { SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth';
import { handleError, ok } from '@/lib/apiResponse';

/** POST /api/auth/logout -- clears the admin session cookie. */

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const store = await cookies();
    store.set(SESSION_COOKIE, '', sessionCookieOptions(0));
    return ok({ signedOut: true });
  } catch (error) {
    return handleError(error);
  }
}
