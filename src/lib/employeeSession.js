import { cookies } from 'next/headers';
import { EMPLOYEE_SESSION_COOKIE, verifyEmployeeSessionToken } from './employeeAuth';

/** Server-side employee session helpers for route handlers and server components. */

/** @returns {Promise<{ sub: string, exp: number } | null>} */
export async function getEmployeeSession() {
  const store = await cookies();
  return verifyEmployeeSessionToken(store.get(EMPLOYEE_SESSION_COOKIE)?.value);
}

/** Throws a 401-shaped error when there is no valid employee session. */
export async function requireEmployee() {
  const session = await getEmployeeSession();
  if (!session) {
    const error = new Error('You must be logged in to do that.');
    error.status = 401;
    error.code = 'UNAUTHORISED';
    throw error;
  }
  return session;
}
