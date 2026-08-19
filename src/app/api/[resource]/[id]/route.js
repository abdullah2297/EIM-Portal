import { deleteRecord, findById, updateRecord } from '@/lib/db';
import { getResourceConfig } from '@/lib/resourceConfig';
import { fail, handleError, ok } from '@/lib/apiResponse';
import { requireAdmin } from '@/lib/session';

/**
 * Generic single-record endpoint.
 *
 *   GET    /api/:resource/:id
 *   PUT    /api/:resource/:id     replace / merge (admin session required)
 *   DELETE /api/:resource/:id     remove          (admin session required)
 */

export const dynamic = 'force-dynamic';

function resolve(resource) {
  const config = getResourceConfig(resource);
  if (!config || config.singleton) {
    const error = new Error(`Unknown resource "${resource}".`);
    error.status = 404;
    error.code = 'UNKNOWN_RESOURCE';
    throw error;
  }
  return config;
}

export async function GET(request, { params }) {
  try {
    const { resource, id } = await params;
    resolve(resource);
    const record = await findById(resource, id);
    if (!record) return fail('Record not found.', { status: 404, code: 'NOT_FOUND' });
    return ok(record);
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request, { params }) {
  try {
    const { resource, id } = await params;
    resolve(resource);
    await requireAdmin();

    let payload;
    try {
      payload = await request.json();
    } catch {
      return fail('Request body must be valid JSON.', { code: 'INVALID_BODY' });
    }

    const record = await updateRecord(resource, id, payload);
    return ok(record);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request, context) {
  return PUT(request, context);
}

export async function DELETE(request, { params }) {
  try {
    const { resource, id } = await params;
    resolve(resource);
    await requireAdmin();
    const result = await deleteRecord(resource, id);
    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}
