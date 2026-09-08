import { requireEmployee } from '@/lib/employeeSession';
import { lookupAbbreviations } from '@/lib/abbreviations';
import { fail, handleError, ok } from '@/lib/apiResponse';

/**
 * POST /api/abbreviations/lookup
 *
 * Resolves a comma-separated list of words/phrases against the bundled
 * abbreviations dictionary. Employee-gated only - the page isn't registered
 * in `SITE_SECTIONS`, so any logged-in employee can reach it without a
 * dedicated permission.
 */

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    await requireEmployee();

    let body;
    try {
      body = await request.json();
    } catch {
      return fail('Request body must be valid JSON.', { code: 'INVALID_BODY' });
    }

    const input = typeof body?.input === 'string' ? body.input : '';
    if (!input.trim()) {
      return fail('Enter at least one word or phrase.', { code: 'EMPTY_INPUT' });
    }

    return ok({ results: lookupAbbreviations(input) });
  } catch (error) {
    return handleError(error);
  }
}
