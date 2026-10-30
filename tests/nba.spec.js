// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://nba.tomjt.com';

test.describe('nba.tomjt.com - NBA Win Predictor Functionality & Accessibility', () => {
  test('page load, header content, and dataset link accessibility', async ({ page }) => {
    const response = await page.goto(BASE_URL);
    expect(response?.status()).toBe(200);

    await expect(page).toHaveURL(/https:\/\/nba\.tomjt\.com\/?/);
    await expect(page).toHaveTitle('NBA Win Predictor');

    // Header elements
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('NBA');
    await expect(heading).toContainText('Win Predictor');

    await expect(page.locator('.tagline')).toContainText('Logistic Regression on Team Statistics');
    await expect(page.locator('.trained-tag')).toBeVisible();
    await expect(page.locator('.trained-tag')).toContainText('Trained');

    // Dataset link
    const datasetBtn = page.locator('a.dataset-btn');
    await expect(datasetBtn).toBeVisible();
    await expect(datasetBtn).toContainText('View Dataset');
    await expect(datasetBtn).toHaveAttribute(
      'href',
      /kaggle\.com\/datasets\/eoinamoore\/historical-nba-data-and-player-box-scores/
    );
    await expect(datasetBtn).toHaveAttribute('target', '_blank');
  });

  test('model performance metrics and feature columns content', async ({ page }) => {
    await page.goto(BASE_URL);

    // Model Performance section
    await expect(page.locator('.section-title', { hasText: 'Model Performance' })).toBeVisible();
    const statCards = page.locator('.stats-grid .stat-card');
    await expect(statCards).toHaveCount(4);

    const expectedLabels = ['Test Accuracy', 'Training Games', 'Testing Games', 'Total Games'];
    const statValues = {};

    for (let i = 0; i < expectedLabels.length; i++) {
      const card = statCards.nth(i);
      const label = (await card.locator('.stat-label').textContent())?.trim();
      const value = (await card.locator('.stat-value').textContent())?.trim() || '';
      expect(label).toBe(expectedLabels[i]);
      expect(value.length).toBeGreaterThan(0);
      statValues[expectedLabels[i]] = value;
    }

    // Accuracy is a valid percentage and game counts are positive numbers that add up
    expect(statValues['Test Accuracy']).toMatch(/^\d+(\.\d+)?%$/);
    const parseNum = (str) => Number(str.replace(/,/g, ''));
    const trainGames = parseNum(statValues['Training Games']);
    const testGames = parseNum(statValues['Testing Games']);
    const totalGames = parseNum(statValues['Total Games']);
    expect(trainGames).toBeGreaterThan(0);
    expect(testGames).toBeGreaterThan(0);
    expect(trainGames + testGames).toBe(totalGames);

    // Feature Columns section
    await expect(page.locator('.section-title', { hasText: 'Feature Columns' })).toBeVisible();
    const expectedFeatures = [
      'home',
      'assists',
      'reboundsTotal',
      'blocks',
      'steals',
      'turnovers',
      'foulsPersonal',
      'q1Points',
      'q2Points',
      'fieldGoalsAttempted',
      'threePointersAttempted',
      'freeThrowsAttempted',
    ];

    const featureTags = page.locator('.features .feature-tag');
    const featureTexts = await featureTags.allTextContents();
    for (const feature of expectedFeatures) {
      expect(featureTexts.map((t) => t.trim())).toContain(feature);
    }
  });

  test('predictions table headers, legend, and row data integrity', async ({ page }) => {
    await page.goto(BASE_URL);

    await expect(page.locator('.section-title', { hasText: 'Predictions' })).toBeVisible();

    // Legend items
    const legend = page.locator('.legend');
    await expect(legend).toBeVisible();
    await expect(legend).toContainText('Predicted Result');
    await expect(legend).toContainText('Actual Result');
    await expect(legend).toContainText('Home/Away');

    // Table headers
    const expectedHeaders = [
      'Date', 'Team', 'Opp', 'H/A',
      'A', 'R', 'B', 'S', 'TO', 'F', 'Q1', 'Q2', 'FGA', '3FA', 'FTA',
      'P', 'A',
    ];
    const headers = await page.locator('table thead th').allTextContents();
    expect(headers.map((h) => h.trim())).toEqual(expectedHeaders);

    // Table rows (20 per page)
    const rows = page.locator('table tbody tr');
    await expect(rows).toHaveCount(20);

    // Validate first row data cells and visual status classes
    const firstRow = rows.first();
    await expect(firstRow).toHaveClass(/(correct-row|incorrect-row)/);

    const cells = firstRow.locator('td');
    await expect(cells).toHaveCount(17);

    const dateText = (await cells.nth(0).textContent())?.trim();
    const teamText = (await cells.nth(1).textContent())?.trim();
    const oppText = (await cells.nth(2).textContent())?.trim();
    const homeAwayText = (await cells.nth(3).textContent())?.trim();
    const predText = (await cells.nth(15).textContent())?.trim();
    const actualText = (await cells.nth(16).textContent())?.trim();

    expect(dateText).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(teamText?.length).toBeGreaterThan(0);
    expect(oppText?.length).toBeGreaterThan(0);
    expect(['Home', 'Away']).toContain(homeAwayText);
    expect(['W', 'L']).toContain(predText);
    expect(['W', 'L']).toContain(actualText);

    // Verify row class matches prediction accuracy
    const rowClass = await firstRow.getAttribute('class');
    if (predText === actualText) {
      expect(rowClass).toContain('correct-row');
    } else {
      expect(rowClass).toContain('incorrect-row');
    }
  });

  test('pagination controls navigation and query parameter routing', async ({ page }) => {
    await page.goto(BASE_URL);

    const pagination = page.locator('.pagination');
    await expect(pagination).toBeVisible();

    // On page 1, Prev is disabled and Next is active
    const disabledPrev = pagination.locator('span.disabled', { hasText: 'Prev' });
    await expect(disabledPrev).toBeVisible();
    await expect(pagination.locator('.page-info')).toHaveText(/^1 \/ \d+$/);

    const nextLink = pagination.locator('a', { hasText: 'Next' });
    await expect(nextLink).toBeVisible();
    await expect(nextLink).toHaveAttribute('href', '?page=2');

    // Navigate to Page 2
    await nextLink.click();
    await expect(page).toHaveURL(/\/?\?page=2$/);
    await expect(pagination.locator('.page-info')).toHaveText(/^2 \/ \d+$/);
    await expect(page.locator('table tbody tr')).toHaveCount(20);

    // On page 2, Prev is an active link back to page 1
    const prevLink = pagination.locator('a', { hasText: 'Prev' });
    await expect(prevLink).toBeVisible();
    await expect(prevLink).toHaveAttribute('href', '?page=1');

    // Navigate back to Page 1
    await prevLink.click();
    await expect(page).toHaveURL(/\/?\?page=1$/);
    await expect(pagination.locator('.page-info')).toHaveText(/^1 \/ \d+$/);

    // Direct navigation via query parameter
    await page.goto(`${BASE_URL}/?page=5`);
    await expect(pagination.locator('.page-info')).toHaveText(/^5 \/ \d+$/);
    await expect(pagination.locator('a', { hasText: 'Prev' })).toHaveAttribute('href', '?page=4');
    await expect(pagination.locator('a', { hasText: 'Next' })).toHaveAttribute('href', '?page=6');
  });

  test('semantic structure, keyboard focus, and mobile viewport accessibility', async ({ page }) => {
    await page.goto(BASE_URL);

    // Semantic heading and table landmarks exist
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('table')).toBeVisible();
    await expect(page.locator('table thead th')).toHaveCount(17);

    // Interactive links are keyboard focusable
    const datasetBtn = page.locator('a.dataset-btn');
    await datasetBtn.focus();
    await expect(datasetBtn).toBeFocused();

    // Mobile viewport keeps content readable and table horizontally scrollable
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('.stats-grid')).toBeVisible();

    const tableCardOverflow = await page
      .locator('.card')
      .last()
      .evaluate((el) => window.getComputedStyle(el).overflowX);
    expect(tableCardOverflow).toBe('auto');
  });
});
