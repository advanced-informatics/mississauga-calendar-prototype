// What changes with width: button labels, grid labels and the host page's frame. Each test checks the
// width it runs at against the City's breakpoints (phone below 577px, desktop from 993px; side menu from 769px).
const { test, expect } = require('@playwright/test');
const { openCalendar, selectAddress, hostUrl, today } = require('./helpers');

test('reminder and calendar buttons carry labels on desktop only', async ({ page }) => {
  await openCalendar(page);
  await selectAddress(page, '300 city', '300 City Centre Drive, Mississauga');
  const label = page.locator('#open-calendar .action-btn__label');
  if (page.viewportSize().width >= 993) await expect(label).toBeVisible();
  else await expect(label).toBeHidden();
});

test('the month grid shows waste type names from tablet up, dots only on phones', async ({ page }) => {
  await openCalendar(page);
  await selectAddress(page, '300 city', '300 City Centre Drive, Mississauga');
  await page.getByRole('button', { name: 'Calendar view' }).click();
  const name = page.locator('.grid__label').first();
  if (page.viewportSize().width >= 577) await expect(name).toBeVisible();
  else await expect(name).toBeHidden();
});

test('host page: the frame grows to fit, and the 75% layout puts the side menu on the right', async ({ page }) => {
  await page.clock.setFixedTime(today);
  await page.goto(hostUrl);
  const frameEl = page.locator('#calendar-frame');
  const before = (await frameEl.boundingBox()).height;
  const frame = page.frameLocator('#calendar-frame');
  await frame.getByRole('combobox').fill('300 city');
  await frame.getByRole('option', { name: '300 City Centre Drive, Mississauga' }).click();
  await expect.poll(async () => (await frameEl.boundingBox()).height).toBeGreaterThan(before + 100);

  await page.getByLabel('75%').check();
  const width = page.viewportSize().width;
  const nav = page.getByRole('navigation', { name: 'Waste and recycling' });
  if (width >= 769) {
    await expect(nav).toBeVisible();
    expect((await nav.boundingBox()).x).toBeGreaterThan((await frameEl.boundingBox()).x);
  } else {
    await expect(nav).toBeHidden();
  }
});
