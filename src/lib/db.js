import { neon } from '@neondatabase/serverless';

/**
 * Postgres-backed data layer (server only).
 *
 * Every collection is stored as one JSONB blob in a single `collections`
 * table (`name` -> `data`), keeping the exact same array/object shape the
 * rest of the app already expects - this used to be one JSON file per
 * collection under `/data`, which cannot work on Vercel (its Functions have
 * a read-only, ephemeral filesystem). Postgres gives every function
 * invocation, in any region, a consistent view of the same data.
 *
 * Every other function in this file (`listAll`, `createRecord`, etc.) only
 * calls `readCollection`/`writeCollection`, so nothing outside this module
 * needed to change.
 */

let sqlClient = null;
let schemaReady = null;

/** Lazily creates the Neon query function - avoids requiring DATABASE_URL at import time. */
function getSql() {
  if (!sqlClient) {
    if (!process.env.DATABASE_URL) {
      throw new DbError(
        'DATABASE_URL is not set. Add your Neon connection string to .env.local (or the Vercel project env vars).',
        'MISSING_DATABASE_URL',
        500,
      );
    }
    sqlClient = neon(process.env.DATABASE_URL);
  }
  return sqlClient;
}

/** Creates the `collections` table on first use; safe to call repeatedly. */
async function ensureSchema() {
  if (!schemaReady) {
    const sql = getSql();
    schemaReady = sql`
      CREATE TABLE IF NOT EXISTS collections (
        name TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `.catch((error) => {
      schemaReady = null; // let the next call retry instead of caching a failure
      throw error;
    });
  }
  return schemaReady;
}

/** Maps a public resource name -> the row it lives in. Also the set of known collections. */
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

export class DbError extends Error {
  constructor(message, code = 'DB_ERROR', status = 500) {
    super(message);
    this.name = 'DbError';
    this.code = code;
    this.status = status;
  }
}

/** @param {string} collection */
function assertKnownCollection(collection) {
  if (!COLLECTION_FILES[collection]) {
    throw new DbError(`Unknown collection "${collection}".`, 'UNKNOWN_COLLECTION', 404);
  }
}

/**
 * Reads a collection's JSONB blob.
 * @param {string} collection
 * @returns {Promise<any>}
 */
export async function readCollection(collection) {
  assertKnownCollection(collection);
  try {
    await ensureSchema();
    const sql = getSql();
    const rows = await sql`SELECT data FROM collections WHERE name = ${collection}`;
    if (!rows.length) return SINGLETONS.has(collection) ? {} : [];
    const { data } = rows[0];
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch (error) {
    if (error instanceof DbError) throw error;
    throw new DbError(`Could not read "${collection}".`, 'READ_FAILED', 500);
  }
}

/**
 * Upserts a collection's JSONB blob.
 * @param {string} collection
 * @param {any} payload
 */
export async function writeCollection(collection, payload) {
  assertKnownCollection(collection);
  try {
    await ensureSchema();
    const sql = getSql();
    await sql`
      INSERT INTO collections (name, data, updated_at)
      VALUES (${collection}, ${JSON.stringify(payload)}::jsonb, now())
      ON CONFLICT (name) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at
    `;
  } catch (error) {
    if (error instanceof DbError) throw error;
    throw new DbError(`Could not save "${collection}".`, 'WRITE_FAILED', 500);
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
