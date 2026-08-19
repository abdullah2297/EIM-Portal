/**
 * End-to-end check of the REST layer and the admin panel.
 *
 *   node scripts/verify-api.mjs http://localhost:3210
 *
 * Confirms that write endpoints reject anonymous callers, that signing in
 * issues a working session, that a full create -> read -> update -> delete
 * cycle works, and that the public forms validate their input.
 */

const BASE = process.argv[2] ?? 'http://localhost:3210';

let cookie = '';
const results = [];

function check(name, passed, detail = '') {
  results.push({ name, passed, detail });
  console.log(`${passed ? 'PASS' : 'FAIL'}  ${name}${detail ? ` -- ${detail}` : ''}`);
}

async function call(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
      ...options.headers,
    },
  });
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) cookie = setCookie.split(';')[0];
  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  return { status: response.status, body };
}

// -- Public reads -------------------------------------------------------------
const list = await call('/api/employees?limit=3');
check('GET /api/employees returns data', list.status === 200 && list.body?.data?.length === 3);

const paged = await call('/api/employees?page=2&pageSize=5');
check(
  'Pagination metadata is returned',
  paged.status === 200 && paged.body?.meta?.page === 2 && paged.body?.meta?.pageSize === 5,
  JSON.stringify(paged.body?.meta ?? {}),
);

const filtered = await call('/api/employees?teamId=team-bi');
check(
  'Filtering by teamId works',
  filtered.status === 200 && filtered.body.data.every((e) => e.teamId === 'team-bi'),
);

const searched = await call('/api/search?q=warehouse');
check('Global search returns grouped results', searched.status === 200 && searched.body.data.total > 0);

const stats = await call('/api/stats');
check('Stats endpoint returns counts', stats.status === 200 && stats.body.data.counts.teams === 5);

const unknown = await call('/api/not-a-collection');
check('Unknown collection returns 404', unknown.status === 404);

// -- Write protection ---------------------------------------------------------
const anonCreate = await call('/api/announcements', {
  method: 'POST',
  body: JSON.stringify({ title: 'Should not be created' }),
});
check('Anonymous create is rejected', anonCreate.status === 401, `status ${anonCreate.status}`);

const anonDelete = await call('/api/employees/emp-001', { method: 'DELETE' });
check('Anonymous delete is rejected', anonDelete.status === 401, `status ${anonDelete.status}`);

// -- Public form validation ---------------------------------------------------
const badContact = await call('/api/contact', {
  method: 'POST',
  body: JSON.stringify({ name: '', email: 'nope', type: 'Idea', subject: '', message: 'short' }),
});
check(
  'Contact form rejects invalid input',
  badContact.status === 400 && Object.keys(badContact.body.error.details).length >= 3,
);

const goodContact = await call('/api/contact', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Verification Script',
    email: 'verify@example.com',
    type: 'Idea',
    subject: 'Automated verification submission',
    message: 'This record was created by the verification script and can be deleted safely.',
  }),
});
check('Contact form accepts valid input', goodContact.status === 201);
const submissionId = goodContact.body?.data?.id;

// -- Auth ---------------------------------------------------------------------
const badLogin = await call('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ username: 'admin', password: 'wrong-password' }),
});
check('Wrong credentials are rejected', badLogin.status === 401);

const login = await call('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({
    username: process.env.ADMIN_USERNAME ?? 'admin',
    password: process.env.ADMIN_PASSWORD ?? 'eim-admin-2026',
  }),
});
check('Sign in succeeds and sets a session cookie', login.status === 200 && cookie.length > 0);

const session = await call('/api/auth/session');
check('Session endpoint reports the signed-in user', session.body?.data?.authenticated === true);

// -- CRUD cycle ---------------------------------------------------------------
const created = await call('/api/announcements', {
  method: 'POST',
  body: JSON.stringify({
    title: 'Verification announcement',
    category: 'Update',
    date: '2026-08-18',
    summary: 'Created by the verification script.',
    content: 'Created by the verification script.',
    attachments: [],
    pinned: false,
    featured: false,
  }),
});
check('Authenticated create succeeds', created.status === 201 && Boolean(created.body?.data?.id));
const recordId = created.body?.data?.id;

const read = await call(`/api/announcements/${recordId}`);
check('Created record can be read back', read.status === 200 && read.body.data.id === recordId);

const updated = await call(`/api/announcements/${recordId}`, {
  method: 'PUT',
  body: JSON.stringify({ title: 'Verification announcement (updated)' }),
});
check(
  'Update persists',
  updated.status === 200 && updated.body.data.title === 'Verification announcement (updated)',
);

const removed = await call(`/api/announcements/${recordId}`, { method: 'DELETE' });
check('Delete succeeds', removed.status === 200);

const readAfterDelete = await call(`/api/announcements/${recordId}`);
check('Deleted record is gone', readAfterDelete.status === 404);

// -- Competition participation -------------------------------------------------
const participate = await call('/api/participate', {
  method: 'POST',
  body: JSON.stringify({
    competitionId: 'cmp-001',
    name: 'Verification Script',
    email: 'verify@example.com',
    message: 'Automated entry.',
  }),
});
check('Competition entry is accepted', participate.status === 201);

const closedEntry = await call('/api/participate', {
  method: 'POST',
  body: JSON.stringify({ competitionId: 'cmp-006', name: 'X', email: 'x@example.com' }),
});
check('Entry to a closed competition is refused', closedEntry.status === 409, `status ${closedEntry.status}`);

// -- Clean up records the script created ---------------------------------------
if (submissionId) await call(`/api/submissions/${submissionId}`, { method: 'DELETE' });
const inbox = await call('/api/submissions?q=Automated%20entry');
for (const item of inbox.body?.data ?? []) {
  await call(`/api/submissions/${item.id}`, { method: 'DELETE' });
}

await call('/api/auth/logout', { method: 'POST' });
const afterLogout = await call('/api/employees/emp-001', { method: 'DELETE' });
check('Sign out invalidates the session', afterLogout.status === 401);

// -- Summary -------------------------------------------------------------------
const failed = results.filter((result) => !result.passed);
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
if (failed.length) {
  console.log('Failures:');
  failed.forEach((f) => console.log(` - ${f.name} ${f.detail}`));
  process.exitCode = 1;
}
