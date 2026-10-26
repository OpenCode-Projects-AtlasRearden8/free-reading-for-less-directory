# STATUS.md — Free Reading for Less directory

Date: 2026-10-26

## What was built

A static, offline, single-page directory of genuinely free reading and
listening resources, maintained by **Asdale Dynamics, LLC**:

- 22 hand-written entries across 6 categories: library ebook & audio apps,
  public-domain text, public-domain audio, open textbooks & courses,
  language learning, and big-library cards.
- Every card carries: what it is, what's truly free, signup needs, honest
  limits, notes, verified-free-on date, and a recheck-by date (quarterly).
- Category filter chips, full-text search box, live result count.
- Fully offline: all JSON is embedded in `index.html`; no external scripts,
  stylesheets, fetch calls, cookies, or trackers. Opens directly via `file://`.
- No affiliate links, referral codes, or tracking parameters anywhere —
  enforced automatically by the test suite.
- `tools/build.js` renders `index.html` from `index.template.html` +
  `data/sites.json` (the single source of truth).
- `tools/test.js`: validation suite for JSON schema/content, build integrity,
  embedded-data match, link allowlist, https-only policy, no-affiliate policy,
  offline single-page guarantees, and the LICENSE copyright line.
- `README.md`: maintenance guide (how to add/recheck/retire entries).
- `LICENSE`: MIT, "Copyright (c) 2026 Asdale Dynamics, LLC".

## How to run it

- Use it: open `index.html` in any browser. No install, no server.
- Rebuild after editing `data/sites.json`: `npm run build`
- Run tests: `npm test`

## Verification results

`npm test` — **ALL TESTS PASSED** (26 checks):

- data/sites.json parses; schema, https URLs, dates, category whitelist,
  duplicate name/url checks pass for all 22 entries.
- Build succeeds; embedded JSON in index.html is byte-identical to source.
- Every outbound link in index.html is a listed site; all URLs https.
- No external scripts, remote stylesheets, or fetch() calls (offline-safe).
- All project files clean of affiliate/tracking markers.
- LICENSE contains the exact required copyright line.

## Known gaps / next steps

- Verification of links was done from written knowledge as of 2026-10-26;
  live site availability should be re-confirmed at the `recheckOn` date
  (2027-01-26) — the card dates make this auditable.
- Entries skew heavily toward U.S.-based services; country-specific
  copyright limits for public-domain material are noted per-entry but could
  be expanded (`gutenberg.org` handles this at download time).
- No entry for non-U.S. readers' national library apps yet (e.g., national
  e-library apps) — good candidates for the next quarterly pass.
- The page has no build-time sitemap/OG image; it's intentionally a plain
  offline single file, so search visibility was not a goal.
