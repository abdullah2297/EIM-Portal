import { cookies } from 'next/headers';
import { createSessionToken, sessionCookieOptions, verifyCredentials, SESSION_COOKIE } from '@/lib/auth';
import { fail, handleError, ok } from '@/lib/apiResponse';

/** POST /api/auth/login -- exchanges credentials for a signed session cookie. */

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return fail('Request body must be valid JSON.', { code: 'INVALID_BODY' });
    }

    const username = String(body?.username ?? '').trim();
    const password = String(body?.password ?? '');

    if (!username || !password) {
      return fail('Username and password are both required.', {
        code: 'VALIDATION_FAILED',
        details: {
          username: username ? undefined : 'Enter your username.',
          password: password ? undefined : 'Enter your password.',
        },
      });
    }

    if (!verifyCredentials(username, password)) {
      return fail('Those credentials were not recognised.', { status: 401, code: 'INVALID_CREDENTIALS' });
    }

    const { token, expiresAt } = await createSessionToken({ username });
    const store = await cookies();
    store.set(
      SESSION_COOKIE,
      token,
      sessionCookieOptions(Math.floor((expiresAt - Date.now()) / 1000)),
    );

    return ok({ username, expiresAt });
  } catch (error) {
    return handleError(error);
  }
}
