import fs from 'node:fs/promises';
import path from 'node:path';
import { neon } from '@neondatabase/serverless';
import { put } from '@vercel/blob';

/**
 * One-time migration: pushes the current contents of `/data/*.json` (and any
 * files under `/data/uploads`) into Neon Postgres + Vercel Blob.
 *
 * Run once, locally, after creating your Neon database and Vercel Blob
 * store, and before your first deploy:
 *
 *   node --env-file=.env.local scripts/migrate-to-neon.mjs
 *
 * Safe to re-run - every collection is upserted (overwritten) and every
 * local file is re-uploaded, so running it twice just repeats the same
 * result (with fresh Blob URLs for the second run's uploads).
 */

const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

const COLLECTION_FILES = {
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

// Matches the "force download" rule in lib/uploads.js - everything else is
// treated as an inline-viewable asset (images).
const DOWNLOAD_EXTENSIONS = new Set(['.zip']);

/** Recursively replaces any string value found in the old->new URL map. */
function rewriteUrls(value, urlMap) {
  if (typeof value === 'string') return urlMap.get(value) ?? value;
  if (Array.isArray(value)) return value.map((item) => rewriteUrls(item, urlMap));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, rewriteUrls(item, urlMap)]),
    );
  }
  return value;
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error(
      'Missing DATABASE_URL.\nRun this script with: node --env-file=.env.local scripts/migrate-to-neon.mjs',
    );
    process.exit(1);
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error(
      'Missing BLOB_READ_WRITE_TOKEN.\nRun this script with: node --env-file=.env.local scripts/migrate-to-neon.mjs',
    );
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  await sql`
    CREATE TABLE IF NOT EXISTS collections (
      name TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log('Postgres schema ready.\n');

  // 1. Re-upload every local file under data/uploads to Vercel Blob, and
  //    remember old-reference -> new-URL so step 2 can rewrite every record
  //    that points at one of these files.
  const urlMap = new Map();
  let uploadFiles = [];
  try {
    uploadFiles = await fs.readdir(UPLOADS_DIR);
  } catch {
    uploadFiles = [];
  }

  for (const fileName of uploadFiles) {
    const buffer = await fs.readFile(path.join(UPLOADS_DIR, fileName));
    const extension = path.extname(fileName).toLowerCase();
    const blob = await put(fileName, buffer, { access: 'public', addRandomSuffix: true });
    const newUrl = DOWNLOAD_EXTENSIONS.has(extension) ? blob.downloadUrl : blob.url;
    urlMap.set(`/api/uploads/${fileName}`, newUrl);
    console.log(`uploaded ${fileName}\n  -> ${newUrl}`);
  }
  if (uploadFiles.length) console.log('');

  // 2. Push each collection into Postgres, rewriting any reference to a
  //    file that just moved to Blob storage.
  for (const [collection, fileName] of Object.entries(COLLECTION_FILES)) {
    let raw;
    try {
      raw = await fs.readFile(path.join(DATA_DIR, fileName), 'utf8');
    } catch {
      console.log(`skipped ${collection} (no local ${fileName})`);
      continue;
    }

    const data = rewriteUrls(JSON.parse(raw), urlMap);
    await sql`
      INSERT INTO collections (name, data, updated_at)
      VALUES (${collection}, ${JSON.stringify(data)}::jsonb, now())
      ON CONFLICT (name) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at
    `;
    console.log(`migrated ${collection} (${Array.isArray(data) ? `${data.length} records` : 'singleton'})`);
  }

  console.log(
    '\nDone. The app now reads and writes Postgres, not the local data/*.json files - those stay on disk as a historical snapshot only.',
  );
}

main().catch((error) => {
  console.error('\nMigration failed:', error);
  process.exit(1);
});
