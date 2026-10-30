// Get calendar: the application choice downloads a calendar file, and print lists twelve months.
const { test, expect } = require('@playwright/test');
const { openCalendar, selectAddress } = require('./helpers');

test.beforeEach(async ({ page }) => {
  await openCalendar(page);
  await selectAddress(page, '300 city', '300 City Centre Drive, Mississauga');
  await page.getByRole('button', { name: 'Get calendar' }).click();
});

test('offers Google Calendar, iCal and Microsoft Outlook, then print', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Get calendar' })).toBeVisible();
  for (const app of ['Google Calendar', 'iCal', 'Microsoft Outlook']) {
    await expect(page.getByRole('link', { name: app })).toHaveAttribute('href', /^blob:/);
  }
  await expect(page.getByRole('button', { name: 'Print calendar' })).toBeVisible();
});

test('the calendar file holds the collections for the address', async ({ page }) => {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('link', { name: 'Microsoft Outlook' }).click()
  ]);
  expect(download.suggestedFilename()).toBe('collection-schedule.ics');
  const ics = require('fs').readFileSync(await download.path(), 'utf8');
  expect(ics).toContain('BEGIN:VCALENDAR');
  expect(ics).toContain('DTSTART;VALUE=DATE:20261030');
  expect(ics).toContain('SUMMARY:Collection: General waste, Organics');
  expect(ics).toContain('LOCATION:300 City Centre Drive\\, Mississauga');
});

test('print lists the next twelve months by month', async ({ page }) => {
  await page.evaluate(() => { window.print = () => { window.printed = true; }; });
  await page.getByRole('button', { name: 'Print calendar' }).click();
  expect(await page.evaluate(() => window.printed)).toBe(true);
  const sheet = page.locator('#print-sheet');
  await expect(sheet.locator('h2').first()).toHaveText('October 2026');
  await expect(sheet.locator('h2')).toHaveCount(13);
  await expect(sheet).toContainText('Friday, November 6: Recycling, Organics');
});

test('back returns to the schedule', async ({ page }) => {
  await page.getByRole('button', { name: 'Back to schedule' }).first().click();
  await expect(page.getByRole('button', { name: 'Get calendar' })).toBeFocused();
});
