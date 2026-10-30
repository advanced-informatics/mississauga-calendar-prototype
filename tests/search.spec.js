// Finding an address: suggestions, not found, clearing, and the selected address field.
const { test, expect } = require('@playwright/test');
const { openCalendar, selectAddress } = require('./helpers');

test.beforeEach(async ({ page }) => { await openCalendar(page); });

test('suggestions show "street, Mississauga" with no postal code', async ({ page }) => {
  await page.getByRole('combobox').fill('lakeshore');
  const options = page.getByRole('option');
  await expect(options).toHaveText(['85 Lakeshore Road East, Mississauga', '95 Lakeshore Road East, Mississauga']);
  await expect(page.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true');
});

test('an unknown address says it was not found', async ({ page }) => {
  await page.getByRole('combobox').fill('1 Nowhere Lane');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByText('This address is not found.')).toBeVisible();
});

test('a single match is chosen with the search button', async ({ page }) => {
  await page.getByRole('combobox').fill('queen');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.locator('#selected-address')).toHaveText('245 Queen Street South, Mississauga');
});

test('selected address sits above its field, and the X clears it', async ({ page }) => {
  await selectAddress(page, '300 city', '300 City Centre Drive, Mississauga');
  const label = await page.getByText('Selected address:').boundingBox();
  const field = await page.locator('#selected-address').boundingBox();
  expect(label.y + label.height).toBeLessThanOrEqual(field.y);
  await expect(page.getByRole('button', { name: 'Clear address and search again' })).toBeFocused();

  await page.getByRole('button', { name: 'Clear address and search again' }).click();
  await expect(page.getByRole('combobox')).toBeFocused();
  await expect(page.getByRole('combobox')).toHaveValue('');
});
