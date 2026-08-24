import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

/**
 * Password hashing for employee accounts - kept separate from
 * `employeeAuth.js` (which `middleware.js` imports and runs on the Edge
 * runtime, where `node:crypto` is unavailable). Only route handlers (Node
 * runtime) should import this file.
 */

/**
 * Hashes a password with a fresh random salt.
 * @param {string} password
 * @returns {{ salt: string, hash: string }}
 */
export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

/**
 * @param {string} password
 * @param {string} salt
 * @param {string} hash
 */
export function verifyPassword(password, salt, hash) {
  try {
    const candidate = scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, 'hex');
    return candidate.length === expected.length && timingSafeEqual(candidate, expected);
  } catch {
    return false;
  }
}
