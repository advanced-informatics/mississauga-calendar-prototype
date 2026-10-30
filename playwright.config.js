// Journey tests for the prototype, run at the three frame widths the City's breakpoints care about:
// phone (below 577px), tablet (577 to 992px) and desktop (993px and up).
// Pages load from disk, so there is no server to start.
const { defineConfig } = require('@playwright/test');

// Locally, PW_CHROMIUM can point at an already-installed Chromium; CI installs its own.
const launchOptions = process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {};

module.exports = defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { browserName: 'chromium', launchOptions, trace: 'retain-on-failure' },
  projects: [
    { name: 'phone', use: { viewport: { width: 375, height: 812 } } },
    { name: 'tablet', use: { viewport: { width: 744, height: 1024 } } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 1024 } } }
  ]
});
