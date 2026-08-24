import { cookies } from 'next/headers';
import { EMPLOYEE_SESSION_COOKIE } from '@/lib/employeeAuth';
import { sessionCookieOptions } from '@/lib/auth';
import { handleError, ok } from '@/lib/apiResponse';

/** POST /api/employee-auth/logout -- clears the employee session cookie. */

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const store = await cookies();
    store.set(EMPLOYEE_SESSION_COOKIE, '', sessionCookieOptions(0));
    return ok({ signedOut: true });
  } catch (error) {
    return handleError(error);
  }
}
