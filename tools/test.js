#!/usr/bin/env node
'use strict';
// Test suite: validates data/sites.json schema/content, rebuilds index.html,
// verifies the embedded data matches the source, and checks link/affiliate policy.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const rootDir = path.join(__dirname, '..');
let failures = 0;
const ok = (m) => console.log(`  PASS  ${m}`);
const fail = (m) => { console.error(`  FAIL  ${m}`); failures++; };

const section = (m) => console.log(`\n== ${m}`);

// ---------- Load data ----------
section('data/sites.json parses');
let data;
try {
  data = JSON.parse(fs.readFileSync(path.join(rootDir, 'data', 'sites.json'), 'utf8'));
  ok('valid JSON');
} catch (e) {
  fail(`JSON parse error: ${e.message}`);
  process.exit(1);
}

section('schema and content rules');
const CATEGORIES = [
  'Library ebook & audio apps',
  'Public-domain text',
  'Public-domain audio',
  'Open textbooks & courses',
  'Language learning',
  'Big-library cards',
];
const REQUIRED = ['name', 'url', 'category', 'tags', 'whatItIs', 'whatsFree',
  'signup', 'honestLimits', 'verifiedOn', 'recheckOn'];
const iso = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

if (!Array.isArray(data.sites) || data.sites.length === 0) fail('sites array missing/empty'); else ok(`sites array with ${data.sites.length} entries`);
if (!data.meta || !data.meta.title) fail('meta.title missing'); else ok('meta.title present');
if (!data.checks) fail('checks missing'); else ok('checks present');

const names = new Set();
const urls = new Set();
data.sites.forEach((s, i) => {
  for (const k of REQUIRED) {
    if (s[k] === undefined || s[k] === '') fail(`site ${i + 1}: missing field "${k}"`);
  }
  if (typeof s.name !== 'string' || s.name.length < 3 || s.name.length > 80) fail(`site ${i + 1}: bad name`);
  if (typeof s.url !== 'string' || !/^https:\/\/[^\s]+$/.test(s.url)) fail(`site ${i + 1}: url must start with https`);
  if (!CATEGORIES.includes(s.category)) fail(`site ${i + 1}: unknown category "${s.category}"`);
  if (!Array.isArray(s.tags) || s.tags.length === 0) fail(`site ${i + 1}: tags missing`);
  ['whatItIs', 'whatsFree', 'signup', 'honestLimits'].forEach((k) => {
    if (typeof s[k] === 'string' && s[k].length < 20) fail(`site ${i + 1}: ${k} too short (<20 chars)`);
  });
  if (!iso(s.verifiedOn)) fail(`site ${i + 1}: verifiedOn not YYYY-MM-DD`);
  if (!iso(s.recheckOn)) fail(`site ${i + 1}: recheckOn not YYYY-MM-DD`);
  if (iso(s.verifiedOn) && iso(s.recheckOn) && s.recheckOn <= s.verifiedOn) fail(`site ${i + 1}: recheckOn must be after verifiedOn`);
  if (names.has(s.name)) fail(`site ${i + 1}: duplicate name "${s.name}"`);
  if (urls.has(s.url)) fail(`site ${i + 1}: duplicate url ${s.url}`);
  names.add(s.name); urls.add(s.url);
});
if (failures === 0) ok(`all entries valid (${CATEGORIES.length} categories Aurora-checked)`);

section('free-verification freshness');
if (data.checks.recheckOn && iso(data.checks.recheckOn)) ok(`global recheck ${data.checks.recheckOn}`); else fail('checks.recheckOn invalid');
const stale = data.sites.filter((s) => s.recheckOn <= data.checks.verifiedOn);
if (stale.length === 0) ok('no entry reassures less than its recheck date' ); else fail(`${stale.length} entries with recheckOn <= verifiedOn`);

// ---------- Build ----------
section('build');
try {
  execFileSync(process.execPath, [path.join(rootDir, 'tools', 'build.js')], { stdio: 'inherit' });
  ok('build succeeds');
} catch (e) {
  fail(`build failed: ${e.message}`);
}

// ---------- Embedded data matches ----------
section('index.html embeds the JSON');
const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const m = html.match(/<script id="site-data" type="application\/json">([\s\S]*?)<\/script>/);
if (!m) fail('embedded JSON block not found');
else {
  try {
    const embedded = JSON.parse(m[1]);
    JSON.stringify(embedded) === JSON.stringify(data)
      ? ok('embedded data identical to data/sites.json')
      : fail('embedded data differs from data/sites.json — rebuild needed');
  } catch (e) { fail(`embedded JSON invalid: ${e.message}`); }
}
if (!html.includes('__SITES_JSON__')) ok('no leftover placeholder in index.html'); else fail('placeholder left in output');

// ---------- Link & affiliate policy ----------
section('link and no-affiliate policy');
const hrefs = [...html.matchAll(/https?:\/\/[^\s"'<>]+/g)].map((r) => r[0].replace(/[.,)]*$/, ''));
const allowed = new Set(data.sites.map((s) => s.url));
const stray = hrefs.filter((h) => !allowed.has(h));
if (stray.length === 0) ok('every outbound link in index.html is a listed site'); else fail(`unlisted outbound links: ${stray.join(', ')}`);
const nonHttps = data.sites.filter((s) => !s.url.startsWith('https://'));
if (nonHttps.length === 0) ok('all site URLs are https'); else fail(`${nonHttps.length} non-https URLs in data`);

for (const f of ['index.html', 'index.template.html', 'data/sites.json', 'README.md', 'STATUS.md']) {
  const p = path.join(rootDir, f);
  if (!fs.existsSync(p)) continue;
  const text = fs.readFileSync(p, 'utf8').toLowerCase();
  // The no-affiliate *policy* legitimately uses the word "affiliate"; strip refusing
  // phrases so the check looks for actual affiliate usage, not the policy statement.
  const sanitized = text.replace(/(?:no[-\s]*|not\s+an\s+)[- ]?affiliate[^\n]*/gi, '');
  if (/affiliate|shareasale|cj\.com|rakuten|awin|\btag=[\w-]+|\butm_\w+=/.test(sanitized)) fail(`${f} mentions affiliate programs/tracking — policy violation`);
  else ok(`${f} clean of affiliate links`);
}

section('offline single-page promise');
const scripts = [...html.matchAll(/<script[^>]*src=/g)];
if (scripts.length === 0) ok('no external script tags (offline-safe)'); else fail('external script found — breaks offline single-file promise');
if (!/<link[^>]+(href=["']https?:)/i.test(html)) ok('no remote stylesheets'); else fail('remote stylesheet found');
if ((html.match(/fetch\s*\(/gi) || []).length === 0) ok('no runtime fetch() calls (works from file://)'); else fail('fetch() found — fails on file:// offline use');

// ---------- LICENSE ----------
section('LICENSE');
const license = safeRead(path.join(rootDir, 'LICENSE'));
if (license === null) fail('LICENSE file missing');
else if (license.includes('Copyright (c) 2026 Asdale Dynamics, LLC')) ok('exact copyright line present');
else fail('LICENSE copyright line missing or not exact');

function safeRead(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return null; }
}

// ---------- Summary ----------
console.log(`\n${failures === 0 ? 'ALL TESTS PASSED' : `${failures} FAILURE(S)`}`);
process.exit(failures === 0 ? 0 : 1);
