// Shared steps for the journey tests. The clock is fixed to Friday 30 October 2026, 10:00, so collection
// dates are the same on every run (300 City Centre Drive is collected on Fridays).
const path = require('path');
const { expect } = require('@playwright/test');

const root = path.resolve(__dirname, '..');
const calendarUrl = 'file://' + path.join(root, 'calendar', 'index.html');
const hostUrl = 'file://' + path.join(root, 'index.html');
const today = new Date('2026-10-30T10:00:00');

async function openCalendar(page) {
  await page.clock.setFixedTime(today);
  await page.goto(calendarUrl);
}

async function selectAddress(page, typed, label) {
  await page.getByRole('combobox').fill(typed);
  await page.getByRole('option', { name: label }).click();
  await expect(page.locator('#selected-address')).toHaveText(label);
}

module.exports = { calendarUrl, hostUrl, today, openCalendar, selectAddress };
