const { test, expect } = require('@playwright/test');

const generatedUsername = Math.random().toString(36).substring(7) + '@testmail.com';
const generatedPassword = Math.random().toString(36).substring(7);

const loginTestUser = 'test@mail.com';
const passwordTestUser = 'tom';
test('registration testing', async ({ page }) => {
    await page.goto('https://www.cryptoport.tomtait.dev/register');
    await expect(page.locator('form')).toBeVisible();

    await page.type('input[name="email"]', generatedUsername)
    await page.type('input[name="password"]', generatedPassword)
    await page.type('input[name="confirmPassword"]', generatedPassword)
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('https://www.cryptoport.tomtait.dev/login?registered=true');
})

test('login testing', async ({ page }) => {
    await page.goto('https://www.cryptoport.tomtait.dev/login');
    await expect(page.locator('form')).toBeVisible();

    await page.type('input[name="username"]', loginTestUser)
    await page.type('input[name="password"]', passwordTestUser)
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('https://www.cryptoport.tomtait.dev');
});

