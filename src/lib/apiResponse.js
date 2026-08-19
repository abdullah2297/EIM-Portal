import { NextResponse } from 'next/server';

/**
 * Every REST endpoint answers with the same envelope so the client service
 * layer only ever has to understand one shape.
 *
 * Success: `{ success: true, data, meta? }`
 * Failure: `{ success: false, error: { message, code, details? } }`
 */

/**
 * @param {*} data
 * @param {{ status?: number, meta?: object }} [options]
 */
export function ok(data, options = {}) {
  const { status = 200, meta } = options;
  return NextResponse.json({ success: true, data, ...(meta ? { meta } : {}) }, { status });
}

/**
 * @param {string} message
 * @param {{ status?: number, code?: string, details?: * }} [options]
 */
export function fail(message, options = {}) {
  const { status = 400, code = 'BAD_REQUEST', details } = options;
  return NextResponse.json(
    { success: false, error: { message, code, ...(details ? { details } : {}) } },
    { status },
  );
}

/** Normalises any thrown value into the error envelope. */
export function handleError(error) {
  const status = error?.status ?? 500;
  const code = error?.code ?? 'INTERNAL_ERROR';
  const message =
    status === 500 ? 'Something went wrong while processing the request.' : error?.message;

  if (status === 500) {
    // Surfaced in the server log only - never leaked to the client.
    console.error('[api]', error);
  }

  return fail(message ?? 'Unexpected error.', { status, code });
}

/** Builds the pagination `meta` block. */
export function paginationMeta(total, page, pageSize) {
  return {
    total,
    page,
    pageSize,
    totalPages: pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1,
  };
}

/**
 * Applies `page` / `pageSize` search params to an array.
 * @template T
 * @param {T[]} items
 * @param {URLSearchParams} searchParams
 * @returns {{ items: T[], meta: ReturnType<typeof paginationMeta> } }
 */
export function paginate(items, searchParams) {
  const rawPage = Number.parseInt(searchParams.get('page') ?? '', 10);
  const rawSize = Number.parseInt(searchParams.get('pageSize') ?? '', 10);

  if (!Number.isFinite(rawSize) || rawSize <= 0) {
    return { items, meta: paginationMeta(items.length, 1, items.length || 1) };
  }

  const pageSize = Math.min(rawSize, 100);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(Math.max(Number.isFinite(rawPage) ? rawPage : 1, 1), totalPages);
  const start = (page - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    meta: paginationMeta(items.length, page, pageSize),
  };
}
