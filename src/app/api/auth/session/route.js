import { getSession } from '@/lib/session';
import { handleError, ok } from '@/lib/apiResponse';

/** GET /api/auth/session -- returns the current admin session, if any. */

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    return ok(
      session
        ? { authenticated: true, username: session.sub, expiresAt: session.exp }
        : { authenticated: false },
    );
  } catch (error) {
    return handleError(error);
  }
}
