// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://tomjt.com';

test.describe('tomjt.com - Portfolio Functionality & Accessibility', () => {
  test('page load, metadata, and main sections visibility', async ({ page }) => {
    const response = await page.goto(BASE_URL);
    expect(response?.status()).toBe(200);

    await expect(page).toHaveURL(/https:\/\/(www\.)?tomjt\.com\/?/);
    await expect(page).toHaveTitle(/Tom Tait \| Portfolio/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    // Verify all primary landmarks and sections are visible
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('#about')).toBeVisible();
    await expect(page.locator('#skills')).toBeVisible();
    await expect(page.locator('#experience')).toBeVisible();
    await expect(page.locator('#education')).toBeVisible();
    await expect(page.locator('#projects')).toBeVisible();
    await expect(page.locator('#contact')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('content accessibility across About, Skills, Experience, Education, Projects, and Contact sections', async ({ page }) => {
    await page.goto(BASE_URL);

    // About section content
    const aboutSection = page.locator('#about');
    await expect(aboutSection.getByRole('heading', { name: "Hi, I'm Tom!" })).toBeVisible();
    await expect(aboutSection.getByRole('heading', { name: /Full-Stack Developer/i })).toBeVisible();
    await expect(aboutSection.getByRole('link', { name: /GitHub/i })).toHaveAttribute('href', 'https://github.com/t0mtait');
    await expect(aboutSection.getByRole('link', { name: /LinkedIn/i })).toHaveAttribute('href', 'https://www.linkedin.com/in/tom-tait/');

    // Skills section content
    const skillsSection = page.locator('#skills');
    await expect(skillsSection.getByRole('heading', { name: 'Skills' })).toBeVisible();
    for (const category of ['Languages', 'Frontend', 'Backend', 'DevOps & Cloud', 'Tools & Practices']) {
      await expect(skillsSection.getByText(category, { exact: true })).toBeVisible();
    }
    for (const skill of ['TypeScript', 'Python', 'Go', 'React', 'Next.js', 'Tailwind CSS', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'Git']) {
      await expect(skillsSection.getByText(skill, { exact: true })).toBeVisible();
    }

    // Experience section content
    const experienceSection = page.locator('#experience');
    await expect(experienceSection.getByRole('heading', { name: 'Experience' })).toBeVisible();
    await expect(experienceSection.getByRole('heading', { name: 'VeroSource' })).toBeVisible();
    await expect(experienceSection.getByRole('heading', { name: 'Sonrai Security' })).toBeVisible();
    await expect(experienceSection.getByRole('heading', { name: 'Irving Oil' })).toHaveCount(2);

    // Education section content
    const educationSection = page.locator('#education');
    await expect(educationSection.getByRole('heading', { name: 'Education' })).toBeVisible();
    await expect(educationSection.getByRole('heading', { name: 'University of New Brunswick' })).toBeVisible();
    await expect(educationSection.getByText('Bachelor of Computer Science')).toBeVisible();
    await expect(educationSection.getByText('Data Structures & Algorithms')).toBeVisible();

    // Projects section content and links
    const projectsSection = page.locator('#projects');
    await expect(projectsSection.getByRole('heading', { name: 'Projects' })).toBeVisible();
    for (const projectTitle of ['SupplementDB', 'NBA-AI', 'GoFilen']) {
      await expect(projectsSection.getByRole('heading', { name: projectTitle })).toBeVisible();
    }
    await expect(projectsSection.locator('a[href="https://supplementdb.app"]')).toBeVisible();
    await expect(projectsSection.locator('a[href="https://nba.tomjt.com"]')).toBeVisible();
    await expect(projectsSection.locator('a[href="https://github.com/t0mtait/nba-ai"]')).toBeVisible();
    await expect(projectsSection.locator('a[href="https://github.com/t0mtait/gofilen"]')).toBeVisible();

    // Contact section and Footer content
    const contactSection = page.locator('#contact');
    await expect(contactSection.getByRole('heading', { name: 'Get In Touch' })).toBeVisible();
    await expect(contactSection.locator('a[href="mailto:mail@tomjt.com"]')).toBeVisible();
    await expect(contactSection.locator('a[href="https://linkedin.com/in/tom-tait"]')).toBeVisible();
    await expect(contactSection.locator('a[href="https://github.com/t0mtait"]')).toBeVisible();

    const footer = page.locator('footer');
    await expect(footer).toContainText('Tom Tait');
    await expect(footer.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/t0mtait');
    await expect(footer.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', 'https://linkedin.com/in/tom-tait');
  });

  test('navbar anchor navigation and theme toggle functionality', async ({ page }) => {
    await page.goto(BASE_URL);

    // Default theme is dark mode
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);

    // Toggle to light mode
    const themeToggle = page.locator('nav button[aria-label="Toggle theme"]').first();
    await expect(themeToggle).toBeVisible();
    await themeToggle.click();
    await expect(html).not.toHaveClass(/dark/);
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('light');

    // Toggle back to dark mode
    await themeToggle.click();
    await expect(html).toHaveClass(/dark/);
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('dark');

    // Test section anchor navigation links
    const navLinks = [
      { name: 'About', hash: '#about' },
      { name: 'Skills', hash: '#skills' },
      { name: 'Experience', hash: '#experience' },
      { name: 'Education', hash: '#education' },
      { name: 'Projects', hash: '#projects' },
      { name: 'Contact', hash: '#contact' },
    ];

    for (const link of navLinks) {
      const navItem = page.locator('nav ul a', { hasText: link.name });
      await expect(navItem).toBeVisible();
      await navItem.click();
      await expect(page).toHaveURL(new RegExp(`${link.hash}$`));
      await expect(page.locator(link.hash)).toBeVisible();
    }
  });

  test('mobile responsive menu functionality and ARIA state', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);

    const menuButton = page.locator('nav button[aria-label="Toggle navigation menu"]');
    const mobileMenu = page.locator('#mobile-menu');

    await expect(menuButton).toBeVisible();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    await expect(menuButton).toHaveAttribute('aria-controls', 'mobile-menu');

    // Open mobile menu
    await menuButton.click();
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    await expect(mobileMenu).toHaveClass(/opacity-100/);

    // Click a link inside mobile menu and verify menu closes and hash updates
    const mobileProjectsLink = mobileMenu.getByRole('link', { name: 'Projects' });
    await expect(mobileProjectsLink).toBeVisible();
    await mobileProjectsLink.click();

    await expect(page).toHaveURL(/#projects$/);
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('accessibility of images, ARIA attributes, keyboard focus, and external links', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    // All images must have non-empty alt attributes and load properly
    const images = page.locator('img');
    const imgCount = await images.count();
    expect(imgCount).toBeGreaterThan(0);

    for (let i = 0; i < imgCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt, `Image ${i} should have non-empty alt text`).toBeTruthy();

      const isLoaded = await img.evaluate((el) => el.complete && el.naturalWidth > 0);
      expect(isLoaded, `Image "${alt}" should load with naturalWidth > 0`).toBe(true);
    }

    // Decorative background orbs should be hidden from assistive technologies
    const orbs = page.locator('.animated-orb');
    const orbCount = await orbs.count();
    for (let i = 0; i < orbCount; i++) {
      await expect(orbs.nth(i)).toHaveAttribute('aria-hidden', 'true');
    }

    // All links must have an accessible name (text content or aria-label) and valid href
    const links = page.locator('a:visible');
    const linkCount = await links.count();
    expect(linkCount).toBeGreaterThan(0);

    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i);
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();

      const text = (await link.textContent())?.trim();
      const ariaLabel = await link.getAttribute('aria-label');
      expect(
        Boolean((text && text.length > 0) || (ariaLabel && ariaLabel.length > 0)),
        `Link with href="${href}" must have accessible text or aria-label`
      ).toBe(true);

      // External links opening in a new tab should include rel="noopener noreferrer"
      const target = await link.getAttribute('target');
      if (target === '_blank' && href?.startsWith('http')) {
        await expect(link).toHaveAttribute('rel', /noopener/);
      }
    }

    // Interactive controls are focusable via keyboard
    const firstNavLink = page.locator('nav ul a').first();
    await firstNavLink.focus();
    await expect(firstNavLink).toBeFocused();
    const themeButton = page.locator('nav button[aria-label="Toggle theme"]').first();
    await themeButton.focus();
    await expect(themeButton).toBeFocused();
  });
});
