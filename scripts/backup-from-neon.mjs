import fs from 'node:fs/promises';
import path from 'node:path';
import { neon } from '@neondatabase/serverless';

/**
 * Pulls the current contents of every collection back out of Neon Postgres
 * and overwrites the matching `/data/*.json` snapshot with it - the reverse
 * of `migrate-to-neon.mjs`. Run this after making changes through the admin
 * panel (locally or on the deployed site, since both point at the same
 * Neon database) to keep a local backup in sync:
 *
 *   node --env-file=.env.local scripts/backup-from-neon.mjs
 *
 * Safe to re-run - each file is fully overwritten with whatever is in
 * Postgres at the time.
 */

const DATA_DIR = path.join(process.cwd(), 'data');

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

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error(
      'Missing DATABASE_URL.\nRun this script with: node --env-file=.env.local scripts/backup-from-neon.mjs',
    );
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  for (const [collection, fileName] of Object.entries(COLLECTION_FILES)) {
    const rows = await sql`SELECT data FROM collections WHERE name = ${collection}`;
    const data = rows.length ? rows[0].data : collection === 'department' ? {} : [];
    await fs.writeFile(path.join(DATA_DIR, fileName), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
    console.log(`backed up ${collection} (${Array.isArray(data) ? `${data.length} records` : 'singleton'}) -> data/${fileName}`);
  }

  console.log('\nDone. Local data/*.json files now mirror Neon - review the diff and commit if you want to keep this snapshot.');
}

main().catch((error) => {
  console.error('\nBackup failed:', error);
  process.exit(1);
});
