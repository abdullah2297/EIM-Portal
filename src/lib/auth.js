/**
 * Minimal, dependency-free session auth for the admin panel.
 *
 * A signed token (`payload.signature`, HMAC-SHA256) is stored in an httpOnly
 * cookie. Signing and verification use the Web Crypto API so the exact same
 * code runs in the Node runtime (route handlers) and the Edge runtime
 * (middleware).
 *
 * This is intentionally small and self-contained -- swap `verifyCredentials`
 * for LDAP / Azure AD when the department is ready to wire up SSO.
 */

export const SESSION_COOKIE = 'eim_admin_session';

const encoder = new TextEncoder();

function getSecret() {
  return process.env.AUTH_SECRET || 'eim-portal-development-secret-change-me';
}

function sessionLifetimeMs() {
  const hours = Number.parseInt(process.env.AUTH_SESSION_HOURS ?? '12', 10);
  return (Number.isFinite(hours) && hours > 0 ? hours : 12) * 60 * 60 * 1000;
}

/** base64url encode without padding. */
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

/** Constant-time-ish comparison of two base64url strings. */
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Creates a signed session token.
 * @param {{ username: string }} user
 * @returns {Promise<{ token: string, expiresAt: number }>}
 */
export async function createSessionToken(user) {
  const expiresAt = Date.now() + sessionLifetimeMs();
  const payload = toBase64Url(encoder.encode(JSON.stringify({ sub: user.username, exp: expiresAt })));
  const key = await importKey();
  const signature = toBase64Url(await crypto.subtle.sign('HMAC', key, encoder.encode(payload)));
  return { token: `${payload}.${signature}`, expiresAt };
}

/**
 * Verifies a session token and returns its payload, or null when invalid.
 * @param {string | undefined | null} token
 * @returns {Promise<{ sub: string, exp: number } | null>}
 */
export async function verifySessionToken(token) {
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

/**
 * Checks submitted credentials against the environment configuration.
 * @param {string} username
 * @param {string} password
 */
export function verifyCredentials(username, password) {
  const expectedUser = process.env.ADMIN_USERNAME || 'admin';
  const expectedPass = process.env.ADMIN_PASSWORD || 'eim-admin-2026';
  return (
    typeof username === 'string' &&
    typeof password === 'string' &&
    username.trim().toLowerCase() === expectedUser.toLowerCase() &&
    password === expectedPass
  );
}

/** Cookie options shared by login and logout. */
export function sessionCookieOptions(maxAgeSeconds) {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: maxAgeSeconds,
  };
}
