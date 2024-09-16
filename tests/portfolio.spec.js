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
  await expect(page.locator('#btnSwitch')).toHaveText('Light Mode');

  await page.locator('#btnSwitch').click();
  await expect(page.locator('#btnSwitch')).toHaveText('Dark Mode');

  await page.locator('#linkedin').click();
  await expect(page).toHaveURL(/.*tom-tait.*/);
  await page.goto('https://www.tomtait.dev/');

  await page.locator('#github').click();
  await expect(page).toHaveURL('https://github.com/t0mtait');
  await page.goto('https://www.tomtait.dev/');

  await page.locator('#cryptoView').click();
  await expect(page).toHaveURL('https://cryptoport.tomtait.dev/login');
  await page.goto('https://www.tomtait.dev/');

  await page.locator('#cryptoGit').click();
  await expect(page).toHaveURL('https://github.com/t0mtait/cryptoport');
  await page.goto('https://www.tomtait.dev/');

  await page.locator('#translatorView').click();
  await expect(page).toHaveURL('https://translator.tomtait.dev/home');
  await page.goto('https://www.tomtait.dev');

  await page.locator('#translatorGit').click();
  await expect(page).toHaveURL('https://github.com/t0mtait/translator');
  await page.goto('https://www.tomtait.dev');
});
