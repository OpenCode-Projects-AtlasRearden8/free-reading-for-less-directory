# Free Reading for Less directory

A static, offline, single-page directory of **genuinely free** reading and
listening resources: library ebook/audio apps, public-domain libraries, open
textbooks, language-learning freebies, and big-library cards almost anyone can
get. Built and maintained by **Asdale Dynamics, LLC**.

Plain, warm, honest — each card says what something is, what's *truly* free,
what you need to sign up, and the limits we won't pretend away. No affiliate
links, ever.

## What's in here

| File | Purpose |
|---|---|
| `index.html` | The finished, offline single page (generated). |
| `index.template.html` | Page layout, styles, and scripts. JSON is injected at build time. |
| `data/sites.json` | **Source of truth.** Every directory entry lives here. |
| `tools/build.js` | Injects `data/sites.json` into the template → `index.html`. |
| `tools/test.js` | Test suite validating JSON, build output, links, and policy. |
| `LICENSE` | MIT, © 2026 Asdale Dynamics, LLC. |

## How to run it

Nothing to install. Open `index.html` in any browser — it works from
`file://` with no network, server, cookies, or trackers. All data is embedded
in the page; filters and search run entirely in-page.

## How to maintain it

1. Edit `data/sites.json` (add, update, or retire entries).
2. Run `npm test`. It validates JSON schema and content rules, rebuilds
   `index.html`, verifies the embedded data matches the source, checks every
   outbound link against the dataset, and enforces the no-affiliate policy.
   Fix anything it flags.
3. Run `npm run build` (or commit the `index.html` the test suite produced).
4. Update `verifiedOn` on any entry you re-verified by hand, and set the next
   `recheckOn` date. Cadence: quarterly.

### Entry rules

- **Genuinely free.** The core offer costs $0. If "free" needs a credit card,
  a trial that auto-bills, or paid upgrades to work — it doesn't belong.
- **Honest limits.** Every card lists what you *don't* get.
- **Verified dates.** `verifiedOn` is when we confirmed the entry by hand;
  `recheckOn` is the deadline to re-check it.
- **No affiliate links, referral codes, tracking parameters, or paid
  placements.** The test suite enforces this automatically.
- Store additions in git. Update entry validation in `tools/test.js` if you
  extend the schema.

## Credits

This directory was created and maintained by **Asdale Dynamics, LLC** —
beginner-friendly AI education, books, and practical tools.

## License

MIT — see `LICENSE`.
