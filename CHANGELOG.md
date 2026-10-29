# Changelog

Versions of the collection calendar prototype. Front end only, with fake data; designs by Daria (Figma file "Mississauga Calendar Design").

## v0.4.1 (29 October 2026)

- Demo page: the 75% layout applies from 769px up, where the side menu appears. Below 769px the frame is full width. The host page sets the frame's width; the calendar fills whatever it is given.

## v0.4.0 (29 October 2026)

Daria's desktop layout (Figma 204:2412, 27 to 28 Oct).

- Future collections has a list and calendar toggle beside its heading.
- Calendar view: a month grid, Monday first, with each collection day's waste types; days from the next and previous month are greyed. On phones the days show coloured dots only.
- Selecting a waste type in the grid opens a short description with "Find out more"; Escape or the X closes it.

## v0.3.1 (27 October 2026)

- Test addresses use real Mississauga street names (Queen Street South, Lakeshore Road East, Mississauga Road, Airport Road) with made-up house numbers and postal codes. Collection days and waste descriptions are still placeholders until we have the City's wording.

## v0.3.0 (27 October 2026)

Daria's mobile layout update (Figma 154:53, 26 Oct) and her new tablet and desktop layouts (Figma 176:2079).

- Tablet and desktop: "Selected address" and the address on one line, the X right beside them.
- Desktop (frame 993px and wider): the reminder and calendar buttons show their labels, "Get reminder" and "Get calendar".
- Reminder form errors: a summary at the top ("Please provide valid information") linking to each field to fix, an error under each field, and invalid fields outlined in red.
- Focus mode: fields show a clear blue ring when focused, by keyboard or click.
- Sign-up confirmation with a tick icon.
- Address suggestions include the postal code.
- Release notes page, linked from the top bar and the footer.

## v0.2.0 (26 October 2026)

Carol's feedback of 23 October, from Daria's post-feedback design (Figma 154:53).

- An X clears the selected address and returns to the search, in place of the pencil.
- Reminder and calendar are icon buttons with accessible labels, under the address and right-aligned.
- A "Future collections" heading above the month navigation.
- Twelve months ahead; the month list scrolls, and the calendar download covers the same months.
- Phone call reminders removed: email and SMS only.
- Test address "300 City Centre Drive" added.
- The demo page shows the version in its footer.

## v0.1.0 (22 October 2026)

First prototype, from Daria's Version 2.0 (Figma 135:4837).

- Address search with suggestions and a not-found message.
- Upcoming collection first, then the month's collections, one expand control per collection.
- Month navigation with a month picker; empty states for no collections.
- Reminder sign-up form (nothing sent or stored) and an .ics calendar download.
- The City's breakpoints and type scale, sized by the frame's width; the frame reports its height so the host page can size the iframe.
- A stand-in host page with a full-width or 75% switch and a breakpoint readout.
