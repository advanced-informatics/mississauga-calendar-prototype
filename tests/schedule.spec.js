// The schedule: upcoming collection, cards, months, the calendar grid and addresses with no City collection.
const { test, expect } = require('@playwright/test');
const { openCalendar, selectAddress } = require('./helpers');

test.beforeEach(async ({ page }) => { await openCalendar(page); });

test('"Upcoming collection" is a heading above the next collection', async ({ page }) => {
  await selectAddress(page, '300 city', '300 City Centre Drive, Mississauga');
  await expect(page.getByRole('heading', { name: 'Upcoming collection' })).toBeVisible();
  const next = page.locator('#upcoming .card');
  await expect(next).toContainText('Friday, October 30');
  await expect(next).toContainText('General waste');
  await expect(next).toContainText('Organics');
});

test('a card expands to show each waste type with "Find out more"', async ({ page }) => {
  await selectAddress(page, '300 city', '300 City Centre Drive, Mississauga');
  const toggle = page.locator('#upcoming .card__toggle');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('link', { name: 'Find out more about organics' })).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('months: next and previous, and the month picker', async ({ page }) => {
  await selectAddress(page, '300 city', '300 City Centre Drive, Mississauga');
  await expect(page.getByRole('button', { name: 'Previous month' })).toBeDisabled();
  await page.getByRole('button', { name: 'Next month' }).click();
  await expect(page.locator('#month-btn')).toHaveText(/November 2026/);
  await expect(page.locator('#month-collections .card')).toHaveCount(4);

  await page.locator('#month-btn').click();
  await page.getByRole('option', { name: 'January 2027' }).click();
  await expect(page.locator('#month-btn')).toHaveText(/January 2027/);
  await expect(page.locator('#month-collections .card').first()).toContainText('Friday, January 1');
});

test('calendar view: month grid, and a waste type opens a popover that Escape closes', async ({ page }) => {
  await selectAddress(page, '300 city', '300 City Centre Drive, Mississauga');
  await page.getByRole('button', { name: 'Next month' }).click();
  await page.getByRole('button', { name: 'Calendar view' }).click();
  await expect(page.getByRole('button', { name: 'Calendar view' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('grid', { name: 'November 2026' })).toBeVisible();

  const type = page.getByRole('button', { name: 'Recycling, Friday, November 6' });
  await type.click();
  await expect(page.getByRole('dialog', { name: 'Recycling' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(type).toBeFocused();
});

const noService = [
  ['argentia', '3115 Argentia Road, Mississauga', 'business address'],
  ['confederation', '4090 Confederation Parkway, Mississauga', 'private contractor arranged by the building'],
  ['airport', '6900 Airport Road, Mississauga', 'new development']
];
for (const [typed, label, reason] of noService) {
  test(`no City collection: ${label} shows why`, async ({ page }) => {
    await selectAddress(page, typed, label);
    await expect(page.getByText('No upcoming collections for the selected address')).toBeVisible();
    await expect(page.locator('.no-service__text')).toContainText(reason);
    await expect(page.getByRole('link', { name: 'Find out more' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Get reminder' })).toBeHidden();
    await expect(page.getByRole('button', { name: 'Get calendar' })).toBeHidden();
    await expect(page.getByRole('heading', { name: 'Future collections' })).toBeHidden();
  });
}
