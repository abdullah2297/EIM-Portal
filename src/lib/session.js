import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySessionToken } from './auth';

/**
 * Server-side session helpers for route handlers and server components.
 */

/** @returns {Promise<{ sub: string, exp: number } | null>} */
export async function getSession() {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/** Throws a 401-shaped error when there is no valid admin session. */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    const error = new Error('You must be signed in to perform this action.');
    error.status = 401;
    error.code = 'UNAUTHORISED';
    throw error;
  }
  return session;
}
