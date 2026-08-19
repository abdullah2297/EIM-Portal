/**
 * Query helpers shared by the REST layer and the global search endpoint.
 * Pure functions - no I/O - so they are equally usable on the client.
 */

/** Flattens a value (string, number, array, nested object) into searchable text. */
function toSearchText(value) {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.map(toSearchText).join(' ');
  if (typeof value === 'object') return Object.values(value).map(toSearchText).join(' ');
  return String(value);
}

/**
 * Case-insensitive term match across the configured searchable fields.
 * @template T
 * @param {T[]} items
 * @param {string} term
 * @param {string[]} fields
 * @returns {T[]}
 */
export function searchItems(items, term, fields) {
  const needle = String(term ?? '').trim().toLowerCase();
  if (!needle) return items;
  const words = needle.split(/\s+/).filter(Boolean);

  return items.filter((item) => {
    const haystack = fields.map((field) => toSearchText(item?.[field])).join(' ').toLowerCase();
    return words.every((word) => haystack.includes(word));
  });
}

/** Equality match that also succeeds when the record field is an array. */
function matchesValue(fieldValue, expected) {
  if (Array.isArray(fieldValue)) return fieldValue.map(String).includes(String(expected));
  if (typeof fieldValue === 'boolean') return String(fieldValue) === String(expected);
  return String(fieldValue ?? '') === String(expected);
}

/**
 * Applies every allowed filter present in the search params.
 * @template T
 * @param {T[]} items
 * @param {URLSearchParams} searchParams
 * @param {string[]} filterable
 * @returns {T[]}
 */
export function filterItems(items, searchParams, filterable) {
  let result = items;

  filterable.forEach((field) => {
    const value = searchParams.get(field);
    if (value === null || value === '' || value === 'all') return;
    result = result.filter((item) => matchesValue(item?.[field], value));
  });

  // `ids=a,b,c` returns a specific set, preserving the requested order.
  const ids = searchParams.get('ids');
  if (ids) {
    const wanted = ids.split(',').map((v) => v.trim()).filter(Boolean);
    const byId = new Map(result.map((item) => [String(item.id), item]));
    result = wanted.map((id) => byId.get(id)).filter(Boolean);
  }

  return result;
}

/**
 * Sorts a copy of the array.
 * @template T
 * @param {T[]} items
 * @param {string | null} field
 * @param {'asc' | 'desc'} order
 * @returns {T[]}
 */
export function sortItems(items, field, order = 'asc') {
  if (!field) return items;
  const direction = order === 'desc' ? -1 : 1;

  return [...items].sort((a, b) => {
    const left = a?.[field];
    const right = b?.[field];

    if (left === right) return 0;
    if (left === null || left === undefined) return 1;
    if (right === null || right === undefined) return -1;

    if (typeof left === 'number' && typeof right === 'number') {
      return (left - right) * direction;
    }
    // Dates sort correctly as ISO strings, so a plain locale compare is enough.
    return String(left).localeCompare(String(right), 'en', { numeric: true }) * direction;
  });
}

/** Puts `featured`/`pinned` records first while keeping the existing order. */
export function promoteFlagged(items, flag = 'featured') {
  return [...items].sort((a, b) => Number(Boolean(b?.[flag])) - Number(Boolean(a?.[flag])));
}

/**
 * Runs the full list pipeline: filter -> search -> sort -> optional limit.
 * @template T
 * @param {T[]} items
 * @param {URLSearchParams} searchParams
 * @param {{ searchable: string[], filterable: string[], sort: { field: string, order: string } | null }} config
 * @returns {T[]}
 */
export function applyListQuery(items, searchParams, config) {
  let result = filterItems(items, searchParams, config.filterable ?? []);
  result = searchItems(result, searchParams.get('q') ?? '', config.searchable ?? []);

  const sortField = searchParams.get('sort') ?? config.sort?.field ?? null;
  const sortOrder = searchParams.get('order') ?? config.sort?.order ?? 'asc';
  result = sortItems(result, sortField, sortOrder);

  if (searchParams.get('featuredFirst') === 'true') {
    result = promoteFlagged(result);
  }

  const limit = Number.parseInt(searchParams.get('limit') ?? '', 10);
  if (Number.isFinite(limit) && limit > 0) result = result.slice(0, limit);

  return result;
}

/** Builds a query string from a plain object, dropping empty values. */
export function buildQuery(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === 'all') return;
    if (Array.isArray(value)) {
      if (value.length) search.set(key, value.join(','));
      return;
    }
    search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}
