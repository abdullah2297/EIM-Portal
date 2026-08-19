import { DATE_FORMAT } from './constants';

/**
 * Formatting helpers. All date output uses `en-GB` explicitly so that the
 * server render and the client render always agree (no hydration mismatch).
 */

const LOCALE = 'en-GB';

/**
 * @param {string | Date | null | undefined} value
 * @param {'long' | 'short' | 'monthYear'} [style]
 * @returns {string}
 */
export function formatDate(value, style = 'long') {
  if (!value) return '--';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return new Intl.DateTimeFormat(LOCALE, DATE_FORMAT[style] ?? DATE_FORMAT.long).format(date);
}

/** Returns `{ day: '04', month: 'MAR' }` for the compact date chips on cards. */
export function splitDate(value) {
  if (!value) return { day: '--', month: '---' };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { day: '--', month: '---' };
  return {
    day: new Intl.DateTimeFormat(LOCALE, { day: '2-digit' }).format(date),
    month: new Intl.DateTimeFormat(LOCALE, { month: 'short' }).format(date).toUpperCase(),
  };
}

/** Human readable "3 days ago" style label, stable between server and client. */
export function formatRelative(value, now = Date.now()) {
  if (!value) return '';
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return '';
  const diffDays = Math.round((time - now) / 86_400_000);
  const abs = Math.abs(diffDays);
  if (abs === 0) return 'Today';
  if (abs < 30) return new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' }).format(diffDays, 'day');
  if (abs < 365) {
    return new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' }).format(
      Math.round(diffDays / 30),
      'month',
    );
  }
  return new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' }).format(
    Math.round(diffDays / 365),
    'year',
  );
}

/** Number formatting with thousands separators. */
export function formatNumber(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '0';
  return new Intl.NumberFormat(LOCALE).format(Number(value));
}

/** Up to two initials from a person's or team's name. */
export function getInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Deterministic 0-based index into a palette, derived from a string. */
export function hashToIndex(value = '', buckets = 6) {
  let hash = 0;
  const str = String(value);
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) % 100_000;
  }
  return hash % buckets;
}

/** Truncates on a word boundary. */
export function truncate(text = '', max = 140) {
  const value = String(text);
  if (value.length <= max) return value;
  return `${value.slice(0, value.lastIndexOf(' ', max))}...`;
}

/** URL-friendly slug. */
export function slugify(value = '') {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/** Percentage of a competition/initiative window that has elapsed (0-100). */
export function progressBetween(startDate, endDate, now = Date.now()) {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0;
  return Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
}

/** Whole days remaining until `endDate`; never negative. */
export function daysRemaining(endDate, now = Date.now()) {
  const end = new Date(endDate).getTime();
  if (Number.isNaN(end)) return 0;
  return Math.max(0, Math.ceil((end - now) / 86_400_000));
}

/** Human readable file size, e.g. `formatBytes('1536')` -> `'1.5 KB'`. */
export function formatBytes(bytes) {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const exponent = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  const size = value / 1024 ** exponent;
  return `${exponent === 0 ? size : size.toFixed(1)} ${units[exponent]}`;
}

/** Turns a comma or newline separated string into a clean array. */
export function toList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return String(value)
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}
