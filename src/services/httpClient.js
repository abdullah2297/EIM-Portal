/**
 * Thin fetch wrapper shared by every service.
 *
 * UI components never call `fetch` directly -- they call a service, the
 * service calls this client, and this client is the only place that knows
 * about URLs, headers, the response envelope and error shapes.
 */

export class ApiError extends Error {
  /**
   * @param {string} message
   * @param {{ status?: number, code?: string, details?: Record<string, string> }} [meta]
   */
  constructor(message, meta = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = meta.status ?? 0;
    this.code = meta.code ?? 'REQUEST_FAILED';
    this.details = meta.details ?? null;
  }

  /** True when the failure is a lost connection rather than a server response. */
  get isNetworkError() {
    return this.code === 'NETWORK_ERROR';
  }
}

/** Absolute base URL is only needed on the server; the browser uses relatives. */
function resolveUrl(path) {
  if (typeof window !== 'undefined') return path;
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return `${base.replace(/\/$/, '')}${path}`;
}

/**
 * @param {string} path e.g. `/api/employees?limit=5`
 * @param {RequestInit & { parseEnvelope?: boolean }} [options]
 * @returns {Promise<{ data: any, meta: any }>}
 */
export async function request(path, options = {}) {
  const { headers, body, ...rest } = options;

  // FormData sets its own multipart Content-Type (with boundary) - only
  // stamp the JSON one for plain string bodies produced by JSON.stringify.
  const isJsonBody = typeof body === 'string';

  let response;
  try {
    response = await fetch(resolveUrl(path), {
      ...rest,
      headers: {
        ...(isJsonBody ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body,
      cache: 'no-store',
    });
  } catch {
    throw new ApiError(
      'We could not reach the server. Check your connection and try again.',
      { code: 'NETWORK_ERROR' },
    );
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.success) {
    throw new ApiError(payload?.error?.message ?? 'The request could not be completed.', {
      status: response.status,
      code: payload?.error?.code ?? 'REQUEST_FAILED',
      details: payload?.error?.details ?? null,
    });
  }

  return { data: payload.data, meta: payload.meta ?? null };
}

export const http = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) =>
    request(path, { ...options, method: 'POST', body: JSON.stringify(body ?? {}) }),
  put: (path, body, options) =>
    request(path, { ...options, method: 'PUT', body: JSON.stringify(body ?? {}) }),
  del: (path, options) => request(path, { ...options, method: 'DELETE' }),
  /** @param {string} path @param {FormData} formData */
  postForm: (path, formData, options) => request(path, { ...options, method: 'POST', body: formData }),
};

export default http;
