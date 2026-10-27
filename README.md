# Collection calendar prototype

A front-end prototype of a waste collection calendar served inside an iframe, built to test how the calendar behaves when embedded in a municipal web page: frame width at each breakpoint, automatic frame height, and the flows from the mobile design (address search, upcoming collection, month list, reminder sign-up, calendar download).

Fake data only. No back end; nothing is sent or stored. Not a City of Mississauga website.

## Files

- `index.html`: a stand-in host page with a full-width / 75% frame switch and a breakpoint readout. The resize script at the bottom is the snippet a host page would embed.
- `releases.html`: the release notes, read from `CHANGELOG.md` (newest first); linked from the prototype bar and the footer. When releasing, update `CHANGELOG.md` and the version in both links.
- `calendar/`: the calendar itself (`index.html`, `calendar.css`, `calendar.js`, `data.js` with fake addresses).

## Running it

Open `index.html` in a browser, from disk or from the GitHub Pages site. To embed the calendar in another page, point an iframe at `calendar/index.html` and add the resize script from `index.html`.

Test addresses: type "300 city", "sample", "harb", "lakeview" or "industrial" (no collections).
