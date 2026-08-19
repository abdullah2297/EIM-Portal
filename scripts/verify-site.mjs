/**
 * Verification crawler.
 *
 *   node scripts/verify-site.mjs http://localhost:3210
 *
 * Visits every public route at desktop and mobile widths and reports:
 *   - HTTP status of the document
 *   - console errors and uncaught page errors
 *   - failed sub-resource requests (excluding the Google Fonts CDN, which is
 *     unreachable from a sandboxed CI container)
 *   - horizontal overflow of the document
 *   - broken internal links found on the page
 */

import { chromium } from 'playwright';

const BASE = process.argv[2] ?? 'http://localhost:3210';

const ROUTES = [
  '/',
  '/department',
  '/teams',
  '/teams?team=team-bi',
  '/teams?team=team-bi&subTeam=sub-bi-2',
  '/employees',
  '/employees/emp-001',
  '/initiatives',
  '/achievements',
  '/announcements',
  '/success-stories',
  '/competitions',
  '/competitions/cmp-001',
  '/gallery',
  '/recognition',
  '/search?q=data',
  '/contact',
  '/admin/login',
  '/employees/does-not-exist',
];

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 720 },
  { name: 'tablet', width: 768, height: 900 },
  { name: 'desktop', width: 1440, height: 900 },
];

// Google Fonts is unreachable from a sandboxed container, and RSC prefetches
// are cancelled when the crawler closes a page - neither is a real failure.
const IGNORED_REQUEST = /fonts\.(googleapis|gstatic)\.com|[?&]_rsc=/;

/** Routes that are supposed to answer 404 (the not-found screens). */
const EXPECTED_404 = new Set(['/employees/does-not-exist']);

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const report = [];
const internalLinks = new Set();

for (const viewport of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
  });

  for (const route of ROUTES) {
    const page = await context.newPage();
    const consoleErrors = [];
    const failedRequests = [];

    page.on('console', (message) => {
      if (message.type() === 'error' && !IGNORED_REQUEST.test(message.location()?.url ?? '')) {
        consoleErrors.push(message.text());
      }
    });
    page.on('pageerror', (error) => consoleErrors.push(`PAGEERROR: ${error.message}`));
    page.on('requestfailed', (request) => {
      if (!IGNORED_REQUEST.test(request.url())) failedRequests.push(request.url());
    });
    page.on('response', (response) => {
      if (response.status() >= 400 && !IGNORED_REQUEST.test(response.url())) {
        failedRequests.push(`${response.status()} ${response.url()}`);
      }
    });

    let status = 0;
    try {
      const response = await page.goto(`${BASE}${route}`, { waitUntil: 'load', timeout: 45000 });
      status = response?.status() ?? 0;
      // Give client-side data fetches time to settle.
      await page.waitForTimeout(1500);
    } catch (error) {
      consoleErrors.push(`NAVIGATION: ${error.message}`);
    }

    const overflow = await page
      .evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      .catch(() => 0);

    if (viewport.name === 'desktop') {
      const hrefs = await page
        .evaluate(() =>
          [...document.querySelectorAll('a[href^="/"]')].map((a) => a.getAttribute('href')),
        )
        .catch(() => []);
      hrefs.forEach((href) => internalLinks.add(href.split('#')[0]));
    }

    report.push({
      viewport: viewport.name,
      route,
      status,
      overflow,
      consoleErrors,
      failedRequests: [...new Set(failedRequests)],
    });

    await page.close();
  }

  await context.close();
}

// -- Link check --------------------------------------------------------------
const linkResults = [];
const linkPage = await browser.newPage();
for (const href of [...internalLinks].sort()) {
  const response = await linkPage.request.get(`${BASE}${href}`).catch(() => null);
  const status = response?.status() ?? 0;
  if (status >= 400) linkResults.push(`${status} ${href}`);
}
await linkPage.close();
await browser.close();

// -- Output ------------------------------------------------------------------
const problems = report.filter(
  (row) =>
    (row.status >= 400 && !EXPECTED_404.has(row.route)) ||
    row.status === 0 ||
    row.overflow > 1 ||
    row.consoleErrors.filter((e) => !(EXPECTED_404.has(row.route) && e.includes('404'))).length ||
    row.failedRequests.length,
);

console.log(`Checked ${report.length} page loads across ${VIEWPORTS.length} viewports.`);
console.log(`Internal links discovered: ${internalLinks.size}`);
console.log(`Broken internal links: ${linkResults.length}`);
if (linkResults.length) console.log(linkResults.join('\n'));

if (problems.length === 0) {
  console.log('\nNo problems found: every route returned a document, no console errors, no overflow.');
} else {
  console.log(`\n${problems.length} page load(s) with problems:`);
  problems.forEach((row) => {
    console.log(`\n[${row.viewport}] ${row.route} -> status ${row.status}, overflow ${row.overflow}px`);
    row.consoleErrors.slice(0, 5).forEach((error) => console.log(`   console: ${error}`));
    row.failedRequests.slice(0, 5).forEach((request) => console.log(`   request: ${request}`));
  });
}
