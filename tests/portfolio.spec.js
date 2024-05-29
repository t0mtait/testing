const { test, expect } = require('@playwright/test');

test('element visibility testing', async ({ page }) => {
  await page.goto('https://www.tomtait.dev');
  await expect(page).toHaveURL('https://www.tomtait.dev');
  await expect(page).toHaveTitle(/Tom Tait Portfolio/);
  await expect(page.locator('.nav')).toBeVisible();
  await expect(page.locator('#aboutsection')).toBeVisible();
  await expect(page.locator('#experiencesection')).toBeVisible();
  await expect(page.locator('#projectssection')).toBeVisible();
  await expect(page.locator('#contactsection')).toBeVisible();
});

test('button redirect testing', async ({ page }) => {
  await page.goto('https://www.tomtait.dev');

  await page.locator('#btnSwitch').click();
  await expect(page.locator('#btnSwitch')).toHaveText('Light');

  await page.locator('#btnSwitch').click();
  await expect(page.locator('#btnSwitch')).toHaveText('Dark');

  await page.locator('#linkedin').click();
  await expect(page).toHaveURL(/.*tom-tait.*/);
  await page.goto('https://www.tomtait.dev/');

  await page.locator('#github').click();
  await expect(page).toHaveURL('https://github.com/t0mtait');
  await page.goto('https://www.tomtait.dev/');

  await page.locator('#simonView').click();
  await expect(page).toHaveURL('https://simon.tomtait.dev');
  await page.goto('https://www.tomtait.dev/');

  await page.locator('#simonGit').click();
  await expect(page).toHaveURL('https://github.com/t0mtait/simon');
  await page.goto('https://www.tomtait.dev');

  await page.locator('#translatorView').click();
  await expect(page).toHaveURL('https://translator.tomtait.dev/home');
  await page.goto('https://www.tomtait.dev');

  await page.locator('#translatorGit').click();
  await expect(page).toHaveURL('https://github.com/t0mtait/translator');
  await page.goto('https://www.tomtait.dev');
});
