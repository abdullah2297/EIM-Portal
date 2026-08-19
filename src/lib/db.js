import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * JSON-file data layer (server only).
 *
 * Every collection is a single JSON file under `/data`. Writes are serialised
 * per file through an in-process promise chain so two concurrent admin saves
 * can never interleave and corrupt a file, and are written atomically via a
 * temp file + rename.
 *
 * Swapping this module for a real database later only requires keeping the
 * exported function signatures.
 */

const DATA_DIR = path.join(process.cwd(), 'data');

/** Maps a public resource name -> file name on disk. */
export const COLLECTION_FILES = {
  teams: 'teams.json',
  'sub-teams': 'sub-teams.json',
  employees: 'employees.json',
  initiatives: 'initiatives.json',
  achievements: 'achievements.json',
  announcements: 'announcements.json',
  'success-stories': 'success-stories.json',
  competitions: 'competitions.json',
  gallery: 'gallery.json',
  recognition: 'recognition.json',
  submissions: 'submissions.json',
  department: 'department.json',
};

/** Collections stored as a single object rather than an array. */
export const SINGLETONS = new Set(['department']);

/** Per-file write queue: fileName -> tail promise. */
const writeQueues = new Map();

export class DbError extends Error {
  constructor(message, code = 'DB_ERROR', status = 500) {
    super(message);
    this.name = 'DbError';
    this.code = code;
    this.status = status;
  }
}

/** @param {string} collection */
function resolveFile(collection) {
  const fileName = COLLECTION_FILES[collection];
  if (!fileName) {
    throw new DbError(`Unknown collection "${collection}".`, 'UNKNOWN_COLLECTION', 404);
  }
  return path.join(DATA_DIR, fileName);
}

/**
 * Reads and parses a collection file.
 * @param {string} collection
 * @returns {Promise<any>}
 */
export async function readCollection(collection) {
  const file = resolveFile(collection);
  try {
    const raw = await fs.readFile(file, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return SINGLETONS.has(collection) ? {} : [];
    }
    if (error instanceof SyntaxError) {
      throw new DbError(`Data file for "${collection}" is not valid JSON.`, 'INVALID_JSON', 500);
    }
    throw new DbError(`Could not read "${collection}".`, 'READ_FAILED', 500);
  }
}

/**
 * Atomically writes a collection, serialised behind any in-flight write.
 * @param {string} collection
 * @param {any} payload
 */
export async function writeCollection(collection, payload) {
  const file = resolveFile(collection);
  const previous = writeQueues.get(file) ?? Promise.resolve();

  const next = previous
    .catch(() => {}) // A failed earlier write must not block later ones.
    .then(async () => {
      const tmp = `${file}.${process.pid}.tmp`;
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(tmp, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
      await fs.rename(tmp, file);
    });

  writeQueues.set(file, next);
  try {
    await next;
  } catch {
    throw new DbError(`Could not save "${collection}".`, 'WRITE_FAILED', 500);
  } finally {
    if (writeQueues.get(file) === next) writeQueues.delete(file);
  }
  return payload;
}

/**
 * @param {string} collection
 * @returns {Promise<any[]>}
 */
export async function listAll(collection) {
  const data = await readCollection(collection);
  return Array.isArray(data) ? data : [];
}

/**
 * @param {string} collection
 * @param {string} id
 */
export async function findById(collection, id) {
  const items = await listAll(collection);
  return items.find((item) => String(item.id) === String(id)) ?? null;
}

/** Generates a readable, collision-free id such as `emp-a3f19c`. */
export function generateId(prefix = 'itm') {
  const random = Math.random().toString(36).slice(2, 8);
  const time = Date.now().toString(36).slice(-4);
  return `${prefix}-${time}${random}`;
}

/**
 * Appends a record.
 * @param {string} collection
 * @param {Record<string, any>} payload
 * @param {string} idPrefix
 */
export async function createRecord(collection, payload, idPrefix = 'itm') {
  const items = await listAll(collection);
  const record = {
    ...payload,
    id: payload.id && !items.some((i) => i.id === payload.id) ? payload.id : generateId(idPrefix),
    createdAt: payload.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await writeCollection(collection, [record, ...items]);
  return record;
}

/**
 * Merges a partial payload into an existing record.
 * @param {string} collection
 * @param {string} id
 * @param {Record<string, any>} payload
 */
export async function updateRecord(collection, id, payload) {
  const items = await listAll(collection);
  const index = items.findIndex((item) => String(item.id) === String(id));
  if (index === -1) {
    throw new DbError(`No record with id "${id}" in "${collection}".`, 'NOT_FOUND', 404);
  }
  const updated = {
    ...items[index],
    ...payload,
    id: items[index].id,
    updatedAt: new Date().toISOString(),
  };
  const next = [...items];
  next[index] = updated;
  await writeCollection(collection, next);
  return updated;
}

/**
 * @param {string} collection
 * @param {string} id
 */
export async function deleteRecord(collection, id) {
  const items = await listAll(collection);
  const exists = items.some((item) => String(item.id) === String(id));
  if (!exists) {
    throw new DbError(`No record with id "${id}" in "${collection}".`, 'NOT_FOUND', 404);
  }
  await writeCollection(
    collection,
    items.filter((item) => String(item.id) !== String(id)),
  );
  return { id };
}

/**
 * Replaces the whole singleton document (currently only `department`).
 * @param {string} collection
 * @param {Record<string, any>} payload
 */
export async function updateSingleton(collection, payload) {
  const current = await readCollection(collection);
  const merged = { ...current, ...payload, updatedAt: new Date().toISOString() };
  await writeCollection(collection, merged);
  return merged;
}
