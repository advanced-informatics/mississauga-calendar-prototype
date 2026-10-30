// Reminder sign-up: nothing can be sent without a channel, errors are summarised, and a valid form confirms.
const { test, expect } = require('@playwright/test');
const { openCalendar, selectAddress } = require('./helpers');

test.beforeEach(async ({ page }) => {
  await openCalendar(page);
  await selectAddress(page, '300 city', '300 City Centre Drive, Mississauga');
  await page.getByRole('button', { name: 'Get reminder' }).click();
});

test('sign-up is disabled until a channel is chosen', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Sign me up' })).toBeDisabled();
  await page.getByLabel('By email', { exact: true }).check();
  await expect(page.getByRole('button', { name: 'Sign me up' })).toBeEnabled();
});

test('invalid details are listed in a summary and under each field', async ({ page }) => {
  await page.getByLabel('By email', { exact: true }).check();
  await page.getByLabel('By SMS', { exact: true }).check();
  await page.getByLabel('Email address').fill('not-an-email');
  await page.getByRole('button', { name: 'Sign me up' }).click();

  const summary = page.getByRole('alert');
  await expect(summary).toBeFocused();
  await expect(summary.getByRole('link')).toHaveText(['Email address', 'Mobile number']);
  await expect(page.getByText('Enter an email address like name@example.com.')).toBeVisible();
  await expect(page.getByText('Enter your mobile number.')).toBeVisible();

  await summary.getByRole('link', { name: 'Mobile number' }).click();
  await expect(page.getByLabel('Mobile number')).toBeFocused();
});

test('a valid sign-up confirms and returns to the schedule', async ({ page }) => {
  await page.getByLabel('By email', { exact: true }).check();
  await page.getByLabel('Email address').fill('resident@example.com');
  await page.getByRole('button', { name: 'Sign me up' }).click();
  await expect(page.getByText("You're signed up.")).toBeVisible();
  await expect(page.locator('#reminder-summary')).toContainText('300 City Centre Drive, Mississauga');
  await page.getByRole('button', { name: 'Back to schedule' }).last().click();
  await expect(page.getByRole('heading', { name: 'Upcoming collection' })).toBeVisible();
});
