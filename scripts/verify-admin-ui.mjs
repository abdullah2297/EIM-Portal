import { chromium } from 'playwright';
const BASE = 'http://localhost:3210';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 950 } });
const page = await ctx.newPage();
const errs = [];
page.on('pageerror', e => errs.push('PAGEERROR: '+e.message));
page.on('console', m => { if (m.type()==='error' && !/fonts\.g/.test(m.location()?.url||'')) errs.push(m.text()); });
const log = [];

// 1. protected route redirects to login
await page.goto(BASE+'/admin', { waitUntil: 'load' });
log.push('redirect to login: ' + (page.url().includes('/admin/login') ? 'OK' : 'FAIL '+page.url()));
await page.screenshot({ path: '/tmp/admin-login.png', fullPage: true });

// 2. sign in
await page.fill('input[name="username"]', 'admin');
await page.fill('input[name="password"]', 'eim-admin-2026');
await page.click('button[type="submit"]');
await page.waitForURL('**/admin', { timeout: 20000 });
await page.waitForTimeout(2000);
log.push('login: OK -> ' + page.url());
await page.screenshot({ path: '/tmp/admin-dashboard.png', fullPage: true });

// 3. open employees list
await page.goto(BASE+'/admin/employees', { waitUntil: 'load' });
await page.waitForTimeout(2000);
const rows = await page.locator('table.data-table tbody tr').count();
log.push('employee rows: ' + rows);
await page.screenshot({ path: '/tmp/admin-employees.png', fullPage: true });

// 4. create a team
await page.goto(BASE+'/admin/teams/new', { waitUntil: 'load' });
await page.waitForTimeout(1500);
await page.screenshot({ path: '/tmp/admin-form.png', fullPage: true });
// submit empty to check validation
await page.click('button[type="submit"]');
await page.waitForTimeout(800);
const invalid = await page.locator('.field__error').count();
log.push('validation errors shown on empty submit: ' + invalid);

await page.fill('input[name="name"]', 'UI Test Team');
await page.fill('input[name="shortName"]', 'UI Test');
await page.fill('textarea[name="description"]', 'Created by the UI test and deleted immediately after.');
await page.click('button[type="submit"]');
await page.waitForURL('**/admin/teams', { timeout: 20000 });
await page.waitForTimeout(2000);
const created = await page.locator('text=UI Test Team').count();
log.push('created team visible in table: ' + (created>0?'OK':'FAIL'));

// 5. edit it
await page.locator('tr', { hasText: 'UI Test Team' }).locator('a[aria-label^="Edit"]').first().click();
await page.waitForTimeout(2500);
await page.fill('input[name="shortName"]', 'UI Edited');
await page.click('button[type="submit"]');
await page.waitForURL('**/admin/teams', { timeout: 20000 });
await page.waitForTimeout(2000);
log.push('edit persisted: ' + ((await page.locator('text=UI Edited').count())>0?'OK':'FAIL'));

// 6. delete it
await page.locator('tr', { hasText: 'UI Test Team' }).locator('button[aria-label^="Delete"]').first().click();
await page.waitForTimeout(700);
await page.locator('button:has-text("Delete")').last().click();
await page.waitForTimeout(2500);
log.push('deleted: ' + ((await page.locator('text=UI Test Team').count())===0?'OK':'FAIL'));

// 7. mobile admin
const m = await browser.newContext({ viewport: { width: 375, height: 800 }, storageState: await ctx.storageState() });
const mp = await m.newPage();
await mp.goto(BASE+'/admin/employees', { waitUntil: 'load' });
await mp.waitForTimeout(2500);
const mOverflow = await mp.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
log.push('mobile admin overflow: ' + mOverflow + 'px');
await mp.screenshot({ path: '/tmp/admin-mobile.png', fullPage: true });

console.log(log.join('\n'));
console.log('\nconsole errors: ' + (errs.length ? errs.join(' | ') : 'none'));
await browser.close();
