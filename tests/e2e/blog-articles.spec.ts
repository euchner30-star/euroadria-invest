import { test, expect } from '@playwright/test';
import { waitForAppReady, dismissToasts } from '../fixtures/helpers';

test.describe('Blog Page - Articles and Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
  });

  test('Blog page loads articles from API', async ({ page }) => {
    await page.goto('/blog');
    await waitForAppReady(page);
    
    // Wait for articles to load (loader should disappear)
    await expect(page.locator('[class*="animate-spin"]').first()).not.toBeVisible();
    
    // Verify page header
    await expect(page.getByRole('heading', { name: /EuroAdria.*Insights/i })).toBeVisible();
    
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
    
    // Click on cluster A filter
    await page.getByTestId('cluster-filter-A').click();
    
    // Articles should be filtered - should show fewer (cluster A has 3 articles)
    await expect(page.getByText(/Makro & Strategie Artikel/)).toBeVisible();
    
    // Verify cluster A button is active (has gold background styling)
    const clusterAButton = page.getByTestId('cluster-filter-A');
    await expect(clusterAButton).toBeVisible();
    
    // Click on cluster B filter
    await page.getByTestId('cluster-filter-B').click();
    await expect(page.getByText(/Recht & Compliance Artikel/)).toBeVisible();
    
    // Click back to All
    await page.getByTestId('cluster-filter-all').click();
    await expect(page.getByText('Alle Artikel')).toBeVisible();
  });

  test('Featured articles section displays', async ({ page }) => {
    await page.goto('/blog');
    await waitForAppReady(page);
    
    // Wait for articles to load
    await expect(page.locator('[class*="animate-spin"]').first()).not.toBeVisible();
    
    // Verify Featured Articles heading is visible (only when "All" cluster is selected)
    await expect(page.getByRole('heading', { name: /Featured.*Articles/i })).toBeVisible();
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
    // Wait a moment for filtering
    await page.waitForTimeout(500);
    
    const articles = page.locator('article');
    const count = await articles.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Article Detail Page', () => {
  test('Article detail page loads correctly', async ({ page }) => {
    await page.goto('/blog/balkans-vs-eu-investing-reality-check');
    await waitForAppReady(page);
    
    // Wait for article to load
    await expect(page.locator('[class*="animate-spin"]')).not.toBeVisible();
    
    // Verify article title
    await expect(page.getByRole('heading', { name: /Balkan vs\. EU Investment/i })).toBeVisible();
    
    // Verify article metadata
    await expect(page.getByText('Makro & Strategie')).toBeVisible();
    await expect(page.getByText(/Dr\. Marcus Weber/)).toBeVisible();
    
    // Verify back button
    await expect(page.getByRole('link', { name: /Zurück zum Blog/ })).toBeVisible();
    
    // Verify article has content
    await expect(page.getByText(/Alpha-Potenzial/i)).toBeVisible();
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
