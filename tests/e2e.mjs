#!/usr/bin/env node
// End-to-end playthrough of Case File 001 in headless Chromium, at phone size.
// Plays every case from the opening screen to the Deep Archive, finds all six
// margin marks, checks persistence, reset, the hint-reveal path, the offline
// single-file build, horizontal overflow and console errors.
//
//   npm run test:e2e            (needs Playwright: npm i -D playwright, or a global install)
//   SHOTS=1 npm run test:e2e    also save screenshots to tests/screenshots/
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from '../tools/lib.mjs';
import { createServer } from '../tools/serve.mjs';

const require = createRequire(import.meta.url);
function loadPlaywright() {
  try { return require('playwright'); } catch { /* try global */ }
  const g = execSync('npm root -g', { encoding: 'utf8' }).trim();
  return require(path.join(g, 'playwright'));
}
const { chromium } = loadPlaywright();

const SHOTS = !!process.env.SHOTS;
const shotDir = path.join(ROOT, 'tests', 'screenshots');
if (SHOTS) fs.mkdirSync(shotDir, { recursive: true });

const server = createServer();
await new Promise((r) => server.listen(0, r));
const BASE = `http://localhost:${server.address().port}/`;

const launchOpts = {};
if (fs.existsSync('/opt/pw-browsers/chromium')) {
  // Use the preinstalled browser when the bundled one is missing.
  try { chromium.executablePath(); } catch { launchOpts.executablePath = '/opt/pw-browsers/chromium'; }
}
const browser = await chromium.launch(launchOpts);
const errors = [];
let step = 0, passed = 0;

function ok(cond, msg) {
  if (!cond) throw new Error('FAILED: ' + msg);
  passed++;
  console.log('  ✓ ' + msg);
}

async function newPage(opts = {}) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    reducedMotion: 'reduce', ...opts,
  });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  return page;
}
async function shot(page, name) {
  if (!SHOTS) return;
  step++;
  await page.screenshot({ path: path.join(shotDir, `${String(step).padStart(2, '0')}-${name}.png`) });
}
async function noOverflow(page, where) {
  const w = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  ok(w[0] <= w[1] + 1, `no horizontal scroll on ${where} (${w[0]} ≤ ${w[1]})`);
}
async function openEv(page, n, id) {
  await page.click(`a.exhibit[href="#case${n}.ev.${id}"]`);
  await page.waitForSelector('.sheet .sheet-body .ev-base');
}
async function openDeep(page, id) {
  await page.click(`a.exhibit[href="#deep.ev.${id}"]`);
  await page.waitForSelector('.sheet .sheet-body .ev-base');
}
// Closing a dialog goes back one level: a note opened from a photo returns to the photo.
async function closeSheet(page) {
  const before = await page.textContent('#dlg-title');
  await page.click('.sheet-close');
  await page.waitForFunction((t) => { const h = document.querySelector('#dlg-title'); return !h || h.textContent !== t; }, before);
}
async function fileKey(page, value) {
  await page.fill('.key-input', value);
  await page.click('.keyform button[type="submit"]');
}
async function solve(page, n, value) {
  await fileKey(page, value);
  await page.waitForSelector('.filed .filed-key');
  ok(true, `case ${n} accepts "${value}"`);
  await page.click('[data-k="next"]');
  await page.waitForSelector(`main.case h1`);
  await page.waitForFunction((m) => location.hash === '#case' + m, n + 1);
}
async function mark(page, n) {
  const sel = `.ev-base .pmark[data-mark="${n}"]`;
  await page.click(sel);
  await page.waitForFunction((s) => document.querySelector(s).classList.contains('found'), sel);
  ok(true, `margin mark ${n} found`);
}

try {
  /* ── Full playthrough ─────────────────────────────────────────────── */
  console.log('\nPlaythrough');
  const page = await newPage();
  await page.goto(BASE);
  ok((await page.textContent('#begin')).trim() === 'BEGIN INVESTIGATION', 'opening shows BEGIN INVESTIGATION');
  ok((await page.textContent('.op-status')).includes('UNRESOLVED'), 'opening shows STATUS: UNRESOLVED');
  ok((await page.textContent('.op-quote')).includes('Something was left here. Nobody remembers putting it here.'), 'opening quote is exact');
  await shot(page, 'opening');

  await page.click('#begin');
  await page.waitForSelector('.overlay.cover');
  await shot(page, 'cover');
  await page.click('.cover [data-act="go"]');
  await page.waitForSelector('.overlay', { state: 'detached' });
  ok(await page.isVisible('ol.folders'), 'dossier lists the cases');
  ok((await page.$$('.folder.is-sealed')).length === 5, 'five cases start sealed');
  await noOverflow(page, 'dossier');
  await shot(page, 'dossier');

  // CASE 001
  await page.click('a.folder-link[href="#case1"]');
  await page.waitForSelector('main.case');
  ok(!(await page.$('a.exhibit[href="#case1.ev.c1-note"]')), 'the curator’s note is hidden at first');
  await noOverflow(page, 'case 001');
  await shot(page, 'case1');
  await openEv(page, 1, 'c1-report'); await shot(page, 'c1-report'); await closeSheet(page);
  await openEv(page, 1, 'c1-card'); await closeSheet(page);
  await openEv(page, 1, 'c1-photo');
  await page.click('[data-hs="label"]');
  ok((await page.textContent('.inspect')).includes('ON LOAN'), 'photo hotspot shows detail');
  await page.click('[data-hs="under"]');
  ok((await page.textContent('.inspect')).includes('folded index card'), 'the hidden card is found under the cabinet');
  await mark(page, 1);
  await shot(page, 'c1-photo');
  await page.click('.inspect [data-open="c1-note"]');
  await page.waitForSelector('.paper-note');
  await page.waitForTimeout(300);
  const noteFits = await page.evaluate(() => { const n = document.querySelector('.ev-base .note-lines'); return [...n.querySelectorAll('.nl')].every((l) => l.offsetWidth <= n.clientWidth + 1); });
  ok(noteFits, 'curator’s note lines fit without wrapping at 390px');
  await shot(page, 'c1-note');
  await closeSheet(page);
  ok((await page.textContent('#dlg-title')).includes('Photograph'), 'closing the note returns to the photograph');
  await closeSheet(page);
  ok(!(await page.$('.overlay')), 'closing the photograph returns to the case');
  ok(!!(await page.$('a.exhibit[href="#case1.ev.c1-note"]')), 'the note is now listed as evidence');
  await fileKey(page, 'stolen');
  await page.waitForSelector('.key-msg.near');
  ok(true, 'near-miss "stolen" gets a nudge');
  await fileKey(page, 'banana');
  await page.waitForSelector('.key-msg.wrong');
  ok(true, 'a wrong key is rejected');
  await solve(page, 1, 'Present');

  // CASE 002
  await shot(page, 'case2');
  await openEv(page, 2, 'c2-slips');
  await page.click('[data-slip="s09"]');
  await mark(page, 2);
  await shot(page, 'c2-slips');
  await closeSheet(page);
  await openEv(page, 2, 'c2-stills');
  await page.click('[data-zoom="1"]');
  await page.waitForSelector('.clock-zoom');
  await shot(page, 'c2-clock');
  await page.click('[data-still="3"]');
  await page.waitForSelector('[data-still="3"][aria-selected="true"]');
  await shot(page, 'c2-still-11');
  await closeSheet(page);
  await fileKey(page, 'silent');
  await page.waitForSelector('.key-msg.near');
  ok((await page.textContent('.key-msg')).includes('wrong order'), 'SILENT is recognised as the right letters in the wrong order');
  await solve(page, 2, 'listen');

  // CASE 003
  await openEv(page, 3, 'c3-tape');
  await page.click('[data-act="play"]');
  await page.waitForTimeout(1200);
  ok((await page.$$('.tl.shown')).length >= 1, 'transcript follows the tape');
  await page.click('[data-act="play"]');
  await page.click('[data-act="text"]');
  await page.waitForSelector('.morse-text:not([hidden])');
  ok((await page.textContent('.morse-text')).includes('/'), 'pulses can be shown as text');
  await page.click('[data-act="all"]');
  ok((await page.$$('.tl.shown')).length === 21, 'full transcript can be shown');
  await mark(page, 3);
  await shot(page, 'c3-tape');
  await closeSheet(page);
  await openEv(page, 3, 'c3-handbook'); await shot(page, 'c3-handbook'); await closeSheet(page);
  await openEv(page, 3, 'c3-log'); await closeSheet(page);
  await fileKey(page, 'under');
  await page.waitForSelector('.key-msg.near');
  await solve(page, 3, 'look under');

  // CASE 004
  await openEv(page, 4, 'c4-box');
  await shot(page, 'c4-box');
  await page.click('[data-act="try"]');
  await page.waitForSelector('.box-msg:not(:empty)');
  ok(true, 'wrong combination rattles');
  const combo = [5, 6, 9, 3];
  for (let i = 0; i < 4; i++) for (let k = 0; k < combo[i]; k++) await page.click(`[data-dial="${i}"][data-dir="1"]`);
  ok((await page.$$eval('.dial-val', (els) => els.map((e) => e.textContent).join(''))) === '5693', 'dials set to 5693');
  await page.click('[data-act="try"]');
  await page.waitForSelector('.box-contents');
  ok(true, 'the lockbox opens');
  await mark(page, 4);
  await shot(page, 'c4-open');
  await page.click('.box-contents [data-open="c4-wheel"]');
  await page.waitForSelector('.wheel-art');
  for (let i = 0; i < 4; i++) await page.click('[data-turn="1"]');
  ok((await page.textContent('.wheel-set')).includes('Setting 04'), 'cipher wheel turns to setting 4');
  await shot(page, 'c4-wheel');
  await closeSheet(page);
  if (await page.$('.overlay')) await closeSheet(page);
  await openEv(page, 4, 'c4-slip'); await shot(page, 'c4-slip'); await closeSheet(page);
  await openEv(page, 4, 'c4-key'); await closeSheet(page);
  await solve(page, 4, 'index');

  // CASE 005
  await openEv(page, 5, 'c5-index');
  await page.click('[data-drawer="5"]');
  await page.waitForSelector('.tray');
  await page.click('[data-card="0047"]');
  await page.waitForSelector('.lamp-btn');
  ok(true, 'card 0047 gives the lamp (lamp switch appears)');
  await page.click('[data-card="0048"]');
  await mark(page, 5);
  await shot(page, 'c5-index');
  await closeSheet(page);
  ok(!!(await page.$('a.exhibit[href="#case5.ev.c5-lamp"]')), 'the lamp is listed as evidence');
  // Use the lamp on the very first note
  await page.goto(BASE + '#case1');
  await page.waitForSelector('main.case');
  await openEv(page, 1, 'c1-note');
  await page.click('[data-lamp="toggle"]');
  await page.waitForSelector('.uvlayer');
  await shot(page, 'c1-note-beam');
  await page.click('[data-lamp="mode"]');
  await page.waitForSelector('.lamp-flood .uvlayer');
  const glow = await page.$$eval('.uvlayer .q', (els) => els.map((e) => e.textContent).join(''));
  ok(glow.toUpperCase() === 'WITNESS', 'under the lamp the last letters glow: ' + glow.toUpperCase());
  ok((await page.textContent('.ev-base .sr-only')).includes('W, I, T, N, E, S, S'), 'screen readers get the hidden ink as text');
  await shot(page, 'c1-note-uv');
  await closeSheet(page);
  await openEv(page, 1, 'c1-report');
  await page.waitForSelector('.uvlayer .uv-over');
  await shot(page, 'c1-report-uv');
  await page.click('[data-lamp="toggle"]');
  await closeSheet(page);
  await page.goto(BASE + '#case5');
  await page.waitForSelector('main.case');
  await fileKey(page, 'present');
  await page.waitForSelector('.key-msg.near');
  await solve(page, 5, 'the witness');

  // CASE 006
  await openEv(page, 6, 'c6-report');
  ok((await page.textContent('.ev-base [data-today]')).match(/\d{4}/), 'final report is dated today');
  await mark(page, 6);
  await shot(page, 'c6-report');
  await closeSheet(page);
  await openEv(page, 6, 'c6-room');
  await page.click('[data-act="wind"]');
  await page.waitForSelector('[data-act="close"]:not([hidden])', { timeout: 15000 });
  ok((await page.$$('.scene-line.on')).length === 4, 'winding the key plays out the scene');
  await shot(page, 'c6-room');
  await page.click('[data-act="close"]');
  await page.waitForSelector('main.finale');
  await page.waitForSelector('.fin-line.on', { timeout: 8000 });
  ok((await page.textContent('.fin-line')).includes('The object was never the point.'), 'finale begins: "The object was never the point."');
  await shot(page, 'finale-1');
  const seen = new Set();
  for (let i = 0; i < 40 && !(await page.isVisible('.fin-end')); i++) {
    seen.add((await page.textContent('.fin-line')).trim());
    await page.click('.fin-stage').catch(() => {});
    await page.waitForTimeout(500);
  }
  seen.add((await page.textContent('.fin-line')).trim());
  ok(seen.has('Maybe that was the point.') && seen.has('The things worth noticing are rarely the loudest things in the room.'), 'finale shows every line');
  await page.waitForSelector('.fin-end:not([hidden])', { timeout: 15000 });
  ok((await page.textContent('.fin-stamp')).trim().toLowerCase() === 'case closed', 'final stamp: CASE CLOSED');
  await shot(page, 'finale-end');
  await page.click('.fin-end a');
  await page.waitForSelector('main.closed');
  await noOverflow(page, 'closed screen');
  await shot(page, 'closed');

  // DEEP ARCHIVE
  await page.click('.door');
  await page.waitForSelector('.door-panel');
  ok((await page.textContent('.margins')).replace(/\s/g, '') === 'NOTICE', 'notebook margins read N O T I C E');
  await page.fill('#door-key', 'noticed');
  await page.click('.door-form button');
  await page.waitForSelector('.door-panel .key-msg.near');
  await page.click('.door-panel [data-act="hint"]');
  await page.waitForSelector('.door-panel .hint-list li');
  await page.fill('#door-key', 'notice');
  await page.click('.door-form button');
  await page.waitForSelector('main.deep');
  ok(true, 'the Deep Archive opens with NOTICE');
  await shot(page, 'deep');
  await openDeep(page, 'd-box');
  await page.click('[data-act="wind"]');
  await page.waitForSelector('.mbox-inside:not([hidden])', { timeout: 5000 });
  ok(true, 'the music box opens');
  await shot(page, 'deep-box');
  await closeSheet(page);
  await openDeep(page, 'd-plate');
  await page.click('[data-act="develop"]');
  await page.waitForSelector('.plate-caption:not([hidden])', { timeout: 8000 });
  ok(true, 'Plate 7 develops');
  await shot(page, 'deep-plate');
  await closeSheet(page);
  for (const id of ['d-slip', 'd-file000', 'd-questions', 'd-label']) { await openDeep(page, id); await closeSheet(page); }
  await openDeep(page, 'd-notes');
  ok(await page.$('.ev-base [data-final]'), 'curator’s notes carry the final message');
  await page.click('[data-lamp="toggle"]');
  await page.click('[data-lamp="mode"]');
  await page.waitForSelector('.uvlayer .whisper');
  await shot(page, 'deep-notes-uv');
  await closeSheet(page);
  await page.click('a.tb-btn[href="#deep.notes"]');
  await page.waitForSelector('.notebook');
  ok((await page.$$('.nb-keys li')).length === 5, 'notebook lists all five keys');
  await shot(page, 'notebook');
  await closeSheet(page);

  // Back button closes dialogs, not the site
  await openDeep(page, 'd-label');
  await page.goBack();
  await page.waitForSelector('.overlay', { state: 'detached' });
  ok(await page.isVisible('main.deep'), 'browser back closes the open dialog');

  // Persistence
  await page.reload();
  await page.waitForSelector('main.deep');
  ok(true, 'reload keeps progress and position');
  await page.goto(BASE);
  ok((await page.textContent('#begin')).trim() === 'REOPEN THE FILE', 'opening offers REOPEN THE FILE after closing');
  ok((await page.textContent('.op-status')).includes('CLOSED'), 'opening shows STATUS: CLOSED');

  // Reset
  await page.click('#begin');
  await page.waitForSelector('main');
  await page.click('a.tb-btn[href$=".settings"]');
  await page.waitForSelector('.settings');
  await shot(page, 'settings');
  await page.click('[data-act="reset"]');
  await page.click('[data-act="reset-yes"]');
  await page.waitForSelector('#opening:not([hidden])');
  ok((await page.textContent('#begin')).trim() === 'BEGIN INVESTIGATION', 'reset seals the file again');

  /* ── Hint path ─────────────────────────────────────────────────────── */
  console.log('\nHints');
  await page.click('#begin');
  await page.waitForSelector('.overlay.cover');
  await page.click('.cover [data-act="go"]');
  await page.click('a.folder-link[href="#case1"]');
  await page.click('a.hint-link');
  await page.waitForSelector('.hints');
  for (let i = 0; i < 3; i++) await page.click('.hints [data-act="next"]');
  ok((await page.$$('.hint-list li')).length === 3, 'three hints for case 001');
  await page.click('[data-act="ask"]');
  await page.click('[data-act="reveal"]');
  ok((await page.textContent('.reveal-key')).trim() === 'PRESENT', 'last resort reveals the key');
  await shot(page, 'hints');
  await page.click('[data-act="use"]');
  await page.waitForSelector('.filed .filed-key');
  ok(true, 'a revealed key can be filed');

  // Case 004 solved by reveal still leaves the player with the winding key
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('wrenfield.casefile001.v1'));
    Object.assign(s.keys, { 2: 'LISTEN', 3: 'LOOKUNDER' });
    localStorage.setItem('wrenfield.casefile001.v1', JSON.stringify(s));
  });
  await page.reload();
  await page.goto(BASE + '#case4');
  await page.waitForSelector('main.case h1');
  ok((await page.textContent('main.case h1')).includes('Missing Piece'), 'saved keys unseal later cases after a reload');
  await page.click('a.hint-link');
  for (let i = 0; i < 3; i++) await page.click('.hints [data-act="next"]');
  ok((await page.textContent('.hint-list')).includes('5 · 6 · 9 · 3'), 'lockbox hints lead to the combination');
  await page.click('[data-act="ask"]');
  await page.click('[data-act="reveal"]');
  await page.click('[data-act="use"]');
  await page.waitForSelector('.filed .filed-key');
  ok((await page.evaluate(() => JSON.parse(localStorage.getItem('wrenfield.casefile001.v1')).flags.hasKey)) === true, 'solving 004 by reveal still grants the winding key');
  await page.close();

  /* ── Offline single file, desktop size ─────────────────────────────── */
  console.log('\nSingle-file build (file://)');
  const p2 = await newPage({ viewport: { width: 1280, height: 860 }, isMobile: false, hasTouch: false, deviceScaleFactor: 1, reducedMotion: 'no-preference' });
  await p2.goto('file://' + path.join(ROOT, 'dist', 'case-file-001.html'));
  await p2.waitForTimeout(3200);
  await shot(p2, 'desktop-opening');
  await p2.click('#begin');
  await p2.waitForSelector('.overlay.cover');
  await p2.click('.cover [data-act="go"]');
  await p2.click('a.folder-link[href="#case1"]');
  await p2.waitForSelector('main.case');
  await p2.click('a.exhibit[href="#case1.ev.c1-photo"]');
  await p2.waitForSelector('.photo');
  await p2.waitForTimeout(400);
  await shot(p2, 'desktop-photo');
  ok(true, 'single-file build runs from file:// with fonts and art inline');
  await p2.close();

  /* ── Hosting layouts ────────────────────────────────────────────────── */
  // A host that serves the whole project folder (e.g. a folder dropped on
  // Netlify without a build) must still open the game, via ./index.html.
  console.log('\nHosting layouts');
  const rootServer = createServer(ROOT);
  await new Promise((r) => rootServer.listen(0, r));
  const p3 = await newPage();
  await p3.goto(`http://localhost:${rootServer.address().port}/`);
  await p3.waitForURL(/\/site\/$/);
  await p3.waitForSelector('#begin');
  ok((await p3.textContent('#begin')).trim() === 'BEGIN INVESTIGATION', 'project root redirects to the game (whole folder hosted)');
  await p3.click('#begin');
  await p3.waitForSelector('.overlay.cover');
  ok(true, 'the game starts when served from /site/');
  await p3.close();
  rootServer.close();
} catch (e) {
  console.error('\n' + (e && e.stack || e));
  errors.push('TEST: ' + (e && e.message));
} finally {
  await browser.close();
  server.close();
}

const realErrors = errors.filter((e) => !/favicon/i.test(e));
console.log(`\n${passed} checks passed`);
if (realErrors.length) {
  console.error(`✗ ${realErrors.length} error(s):\n  - ` + realErrors.join('\n  - '));
  process.exit(1);
}
console.log('✓ no console errors');
