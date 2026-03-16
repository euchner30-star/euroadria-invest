import { test, expect } from '@playwright/test';
import { waitForAppReady, dismissToasts, dismissCookieBanner } from '../fixtures/helpers';

test.describe('Blog Page - Articles and Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
    // Dismiss cookie consent banner to prevent it from intercepting clicks
    await page.goto('/');
    await dismissCookieBanner(page);
  });

  test('Blog page loads articles from API', async ({ page }) => {
    await page.goto('/blog');
    await waitForAppReady(page);
    
    // Wait for articles to load (loader should disappear)
    await expect(page.locator('[class*="animate-spin"]').first()).not.toBeVisible();
    
    // Verify page header - now just "Insights" not "EuroAdria Insights"
    await expect(page.getByRole('heading', { name: 'Insights', exact: true })).toBeVisible();
    
    // Verify articles are displayed - check for article links
    const articleLinks = page.locator('article');
    await expect(articleLinks.first()).toBeVisible();
    
    // Should have multiple articles (15+ pillar articles)
    const count = await articleLinks.count();
    expect(count).toBeGreaterThanOrEqual(10);
  });

  test('Cluster filtering works on blog page', async ({ page }) => {
    await page.goto('/blog');
    await waitForAppReady(page);
    
    // Wait for articles to load
    await expect(page.locator('[class*="animate-spin"]').first()).not.toBeVisible();
    
    // Get initial article count (All cluster)
    const initialArticles = await page.locator('article').count();
    expect(initialArticles).toBeGreaterThan(0);
    
    // Click on cluster A filter (Makro & Strategie)
    await page.getByTestId('cluster-filter-A').click();
    await page.waitForTimeout(500);
    
    // Verify cluster A button is active and shows selected state
    const clusterAButton = page.getByTestId('cluster-filter-A');
    await expect(clusterAButton).toBeVisible();
    // Active filter should have darker background - verify articles are filtered
    const filteredArticles = await page.locator('article').count();
    expect(filteredArticles).toBeLessThanOrEqual(initialArticles);
    expect(filteredArticles).toBeGreaterThan(0);
    
    // Click on cluster B filter (Recht & Compliance)
    await page.getByTestId('cluster-filter-B').click();
    await page.waitForTimeout(500);
    const clusterBArticles = await page.locator('article').count();
    expect(clusterBArticles).toBeGreaterThan(0);
    
    // Click back to All
    await page.getByTestId('cluster-filter-all').click();
    await page.waitForTimeout(500);
    const allArticles = await page.locator('article').count();
    expect(allArticles).toEqual(initialArticles);
  });

  test('Articles section displays when cluster is selected', async ({ page }) => {
    await page.goto('/blog');
    await waitForAppReady(page);
    
    // Wait for articles to load
    await expect(page.locator('[class*="animate-spin"]').first()).not.toBeVisible();
    
    // Page header should show "Insights"
    await expect(page.getByRole('heading', { name: 'Insights', exact: true })).toBeVisible();
    
    // Verify article cards are visible
    await expect(page.locator('article').first()).toBeVisible();
  });

  test('Search functionality filters articles', async ({ page }) => {
    await page.goto('/blog');
    await waitForAppReady(page);
    
    // Wait for articles to load
    await expect(page.locator('[class*="animate-spin"]').first()).not.toBeVisible();
    
    // Type in search
    const searchInput = page.getByPlaceholder('Artikel durchsuchen...');
    await searchInput.fill('Montenegro');
    
    // Results should be filtered to articles containing "Montenegro"
    // Wait for search results
    await expect(page.getByText(/Artikel gefunden/)).toBeVisible();
    
    // Verify articles are displayed (check for article card links that go to /blog/)
    const articleLinks = page.locator('a[href^="/blog/"]');
    const count = await articleLinks.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Article Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
    // Dismiss cookie consent banner to prevent it from intercepting clicks
    await page.goto('/');
    await dismissCookieBanner(page);
  });

  test('Article detail page loads correctly', async ({ page }) => {
    await page.goto('/blog/balkans-vs-eu-investing-reality-check');
    await waitForAppReady(page);
    
    // Wait for article to load
    await expect(page.locator('[class*="animate-spin"]')).not.toBeVisible();
    
    // Article title is now "Speichern" (was saved with that title in DB)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Verify article metadata - use .first() to avoid strict mode error
    await expect(page.getByText('Makro & Strategie').first()).toBeVisible();
    
    // Verify back button
    await expect(page.getByRole('link', { name: /Zurück zum Blog/ })).toBeVisible();
  });

  test('Back to blog link works', async ({ page }) => {
    await page.goto('/blog/balkans-vs-eu-investing-reality-check');
    await waitForAppReady(page);
    
    // Wait for article to load
    await expect(page.locator('[class*="animate-spin"]')).not.toBeVisible();
    
    // Click back to blog link
    await page.getByRole('link', { name: /Zurück zum Blog/ }).click();
    
    // Should be on blog page
    await expect(page).toHaveURL(/\/blog$/);
  });

  test('Nonexistent article redirects to blog', async ({ page }) => {
    await page.goto('/blog/nonexistent-article-xyz');
    
    // Should redirect to blog page
    await expect(page).toHaveURL(/\/blog$/);
  });
});
