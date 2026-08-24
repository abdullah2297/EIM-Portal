/**
 * Employee-facing session auth - a separate, parallel system from the admin
 * login in `auth.js` (different cookie, different payload), so nothing here
 * risks the admin login and an admin session never implies site access.
 *
 * Signing/verification mirrors `auth.js`'s small HMAC-over-base64url scheme
 * so the same token still works in both the Node and Edge runtimes - this
 * file is imported directly by `middleware.js` (Edge), so it must not import
 * `node:crypto` (not available there); password hashing lives in the sibling
 * `employeePassword.js`, which only route handlers (Node runtime) import.
 */

export const EMPLOYEE_SESSION_COOKIE = 'eim_employee_session';

const encoder = new TextEncoder();

function getSecret() {
  return process.env.AUTH_SECRET || 'eim-portal-development-secret-change-me';
}

function sessionLifetimeMs() {
  const hours = Number.parseInt(process.env.AUTH_SESSION_HOURS ?? '12', 10);
  return (Number.isFinite(hours) && hours > 0 ? hours : 12) * 60 * 60 * 1000;
}

function toBase64Url(bytes) {
  let binary = '';
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  view.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded + '='.repeat((4 - (padded.length % 4)) % 4));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function importKey() {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * The token only proves *identity* (which employee, signed, not expired) -
 * it deliberately does not carry permissions. `middleware.js` looks up the
 * live `employee-credentials` row for `sub` on every gated request, so a
 * reset account or a permission change takes effect immediately, not on the
 * employee's next login.
 *
 * @param {{ employeeId: string }} employee
 * @returns {Promise<{ token: string, expiresAt: number }>}
 */
export async function createEmployeeSessionToken({ employeeId }) {
  const expiresAt = Date.now() + sessionLifetimeMs();
  const payload = toBase64Url(encoder.encode(JSON.stringify({ sub: employeeId, exp: expiresAt })));
  const key = await importKey();
  const signature = toBase64Url(await crypto.subtle.sign('HMAC', key, encoder.encode(payload)));
  return { token: `${payload}.${signature}`, expiresAt };
}

/**
 * @param {string | undefined | null} token
 * @returns {Promise<{ sub: string, exp: number } | null>}
 */
export async function verifyEmployeeSessionToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  try {
    const key = await importKey();
    const expected = toBase64Url(await crypto.subtle.sign('HMAC', key, encoder.encode(payload)));
    if (!safeEqual(expected, signature)) return null;

    const decoded = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)));
    if (!decoded?.exp || decoded.exp < Date.now()) return null;
    return decoded;
  } catch {
    return null;
  }
}
