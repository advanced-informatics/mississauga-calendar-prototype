# Collection calendar prototype

A front-end prototype of a waste collection calendar served inside an iframe, built to test how the calendar behaves when embedded in a municipal web page: frame width at each breakpoint, automatic frame height, and the flows from the mobile design (address search, upcoming collection, month list, reminder sign-up, calendar download).

Test data only: real Mississauga street names with made-up house numbers; invented collection days. No back end; nothing is sent or stored. Not a City of Mississauga website.

## Files

- `index.html`: a stand-in host page with a full-width / 75% frame switch and a breakpoint readout. The resize script at the bottom is the snippet a host page would embed.
- `releases.html`: the release notes, read from `CHANGELOG.md` (newest first); linked from the prototype bar and the footer. When releasing, update `CHANGELOG.md` and the version in both links.
- `calendar/`: the calendar itself (`index.html`, `calendar.css`, `calendar.js`, `data.js` with test addresses).
- `tests/`, `playwright.config.js`, `package.json`: the journey tests (see Tests).

## Running it

Open `index.html` in a browser, from disk or from the GitHub Pages site. To embed the calendar in another page, point an iframe at `calendar/index.html` and add the resize script from `index.html`.

Test addresses (real street names, made-up numbers): type "300 city", "queen", "lakeshore" (two matches) or "mississauga road". No City collection, each with a different reason: "argentia" (business), "confederation" (condo), "airport" (new development).

## Tests

Journey tests in `tests/` (Playwright) cover search, the schedule, months and the calendar grid, addresses with no City collection, reminder sign-up, calendar download and print, and the host page's frame. Each runs at phone (375px), tablet (744px) and desktop (1440px) widths, with the clock fixed to 30 October 2026 so dates don't drift.

```
npm install
npx playwright install chromium   # once
npm test
```

They also run on every push (`.github/workflows/tests.yml`). Pages publishes from `main` regardless, so a red run means fix forward. When a release changes a journey, update its test in the same commit.
