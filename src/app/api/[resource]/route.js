import { createRecord, listAll, readCollection, updateSingleton } from '@/lib/db';
import { getResourceConfig } from '@/lib/resourceConfig';
import { applyListQuery } from '@/lib/query';
import { fail, handleError, ok, paginate } from '@/lib/apiResponse';
import { requireAdmin } from '@/lib/session';
import { sanitizeText } from '@/lib/validation';

/**
 * Generic collection endpoint.
 *
 *   GET  /api/:resource            list, filter, search, sort, paginate
 *   POST /api/:resource            create (admin session required)
 *
 * Supported query parameters:
 *   q, sort, order, page, pageSize, limit, ids, featuredFirst
 *   plus every field listed in the resource's `filterable` config.
 */

export const dynamic = 'force-dynamic';

/** Rejects unknown collections before any I/O happens. */
function resolve(resource) {
  const config = getResourceConfig(resource);
  if (!config) {
    const error = new Error(`Unknown resource "${resource}".`);
    error.status = 404;
    error.code = 'UNKNOWN_RESOURCE';
    throw error;
  }
  return config;
}

export async function GET(request, { params }) {
  try {
    const { resource } = await params;
    const config = resolve(resource);
    if (config.privateRead) await requireAdmin();
    const { searchParams } = new URL(request.url);

    if (config.singleton) {
      return ok(await readCollection(resource));
    }

    const all = await listAll(resource);
    const filtered = applyListQuery(all, searchParams, config);
    const { items, meta } = paginate(filtered, searchParams);

    return ok(items, { meta });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request, { params }) {
  try {
    const { resource } = await params;
    const config = resolve(resource);

    // Submissions come from the public "Get Involved" forms; everything else
    // may only be created by a signed-in administrator.
    if (!config.publicCreate) await requireAdmin();

    let payload;
    try {
      payload = await request.json();
    } catch {
      return fail('Request body must be valid JSON.', { code: 'INVALID_BODY' });
    }

    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return fail('Request body must be an object.', { code: 'INVALID_BODY' });
    }

    if (config.singleton) {
      await requireAdmin();
      return ok(await updateSingleton(resource, payload));
    }

    const titleField = config.titleField;
    if (!sanitizeText(payload[titleField])) {
      return fail(`"${titleField}" is required.`, {
        code: 'VALIDATION_FAILED',
        details: { [titleField]: 'This field is required.' },
      });
    }

    const record = await createRecord(resource, payload, config.idPrefix);
    return ok(record, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
