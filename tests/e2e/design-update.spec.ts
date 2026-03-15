import { test, expect } from '@playwright/test';
import { waitForAppReady, dismissToasts } from '../fixtures/helpers';

test.describe('Design Update - euroadria.me Style Verification', () => {
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
  });

  test('Header has green CTA button (#3eb489)', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    
    // Find the CTA button in header "Jetzt Beratung anfragen"
    const ctaButton = page.locator('header').getByRole('link', { name: /Jetzt Beratung anfragen/i });
    await expect(ctaButton).toBeVisible();
    
    // Verify it has green background color (#3eb489 = rgb(62, 180, 137))
    await expect(ctaButton).toHaveCSS('background-color', /rgb\(62, 180, 137\)/);
  });

  test('Homepage renders with white background content sections', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    
    // Verify page has white background
    const body = page.locator('body');
    await expect(body).toHaveCSS('background', /rgb\(255, 255, 255\)|white/);
    
    // Verify content boxes have white background with borders (glass-card style)
    // The "Warum Balkan statt EU" card should have white background
    const balkanCard = page.locator('.bg-white').first();
    await expect(balkanCard).toBeVisible();
  });

  test('Blog page has green active filter tab', async ({ page }) => {
    await page.goto('/blog');
    await waitForAppReady(page);
    
    // Wait for articles to load
    await expect(page.locator('[class*="animate-spin"]').first()).not.toBeVisible();
    
    // The "Alle" filter should be active by default with green background
    const allFilter = page.getByTestId('cluster-filter-all');
    await expect(allFilter).toBeVisible();
    
    // Verify green background (#3eb489 = rgb(62, 180, 137))
    await expect(allFilter).toHaveCSS('background-color', /rgb\(62, 180, 137\)/);
  });

  test('Blog page has white article cards', async ({ page }) => {
    await page.goto('/blog');
    await waitForAppReady(page);
    
    // Wait for articles to load
    await expect(page.locator('[class*="animate-spin"]').first()).not.toBeVisible();
    
    // Article cards should have white background
    const articleCard = page.locator('article').first();
    await expect(articleCard).toBeVisible();
    
    // Verify white background styling
    await expect(articleCard).toHaveCSS('background-color', /rgb\(255, 255, 255\)|rgba\(255, 255, 255/);
  });

  test('Impressum page has white content boxes with borders', async ({ page }) => {
    await page.goto('/impressum');
    await waitForAppReady(page);
    
    await expect(page.getByTestId('impressum-page')).toBeVisible();
    
    // Verify content sections have white background with border
    const contentSection = page.locator('section').filter({ has: page.getByText('EuroAdria Corporate Solutions') });
    await expect(contentSection).toBeVisible();
    
    // Verify it has white background and visible border
    await expect(contentSection).toHaveCSS('background-color', /rgb\(255, 255, 255\)/);
    await expect(contentSection).toHaveCSS('border-radius', /16px/);
  });

  test('Datenschutz page has correct styling with white boxes', async ({ page }) => {
    await page.goto('/datenschutz');
    await waitForAppReady(page);
    
    await expect(page.getByTestId('datenschutz-page')).toBeVisible();
    
    // Verify page header is green (use first() to avoid strict mode with footer)
    const legalLabel = page.getByTestId('datenschutz-page').getByText('Rechtliches');
    await expect(legalLabel).toBeVisible();
    await expect(legalLabel).toHaveCSS('color', /rgb\(62, 180, 137\)/);
    
    // Verify content sections have white background
    const responsibleSection = page.locator('section').filter({ has: page.getByText('1. Verantwortliche Stelle') });
    await expect(responsibleSection).toBeVisible();
    await expect(responsibleSection).toHaveCSS('background-color', /rgb\(255, 255, 255\)/);
  });

  test('Serbia Executive page has green buttons', async ({ page }) => {
    await page.goto('/serbia-executive');
    await waitForAppReady(page);
    
    await expect(page.getByTestId('serbia-executive-page')).toBeVisible();
    
    // Verify Executive Inquiry CTA has green background
    const ctaButton = page.getByTestId('executive-inquiry-cta');
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toHaveCSS('background-color', /rgb\(62, 180, 137\)/);
    
    // Verify trust indicator values are green
    const trustValue = page.getByText('15+', { exact: true }).first();
    await expect(trustValue).toBeVisible();
    await expect(trustValue).toHaveCSS('color', /rgb\(62, 180, 137\)/);
  });

  test('All navigation links work correctly', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    
    // Test HOME link
    await page.getByRole('link', { name: 'HOME', exact: true }).click();
    await expect(page).toHaveURL('/');
    
    // Test BLOG link
    await page.getByRole('link', { name: 'BLOG', exact: true }).click();
    await expect(page).toHaveURL('/blog');
    
    // Test ÜBER UNS link
    await page.getByRole('link', { name: 'ÜBER UNS', exact: true }).click();
    await expect(page).toHaveURL('/team');
    
    // Test KONTAKT link
    await page.getByRole('link', { name: 'KONTAKT', exact: true }).click();
    await expect(page).toHaveURL('/contact');
    
    // Test SERBIA EXECUTIVE link via data-testid
    const serbiaLink = page.getByTestId('nav-serbia-executive');
    await serbiaLink.click();
    await expect(page).toHaveURL('/serbia-executive');
  });

  test('ShareButtons display correctly with hover styling', async ({ page }) => {
    // Go to Serbia Executive page which has ShareButtons
    await page.goto('/serbia-executive');
    await waitForAppReady(page);
    
    // Scroll to share buttons section
    const shareSection = page.getByTestId('share-buttons');
    await shareSection.scrollIntoViewIfNeeded();
    
    await expect(shareSection).toBeVisible();
    
    // Verify all share buttons are present
    const linkedInBtn = page.getByTestId('share-linkedin');
    const twitterBtn = page.getByTestId('share-twitter');
    const facebookBtn = page.getByTestId('share-facebook');
    const whatsappBtn = page.getByTestId('share-whatsapp');
    const emailBtn = page.getByTestId('share-email');
    
    await expect(linkedInBtn).toBeVisible();
    await expect(twitterBtn).toBeVisible();
    await expect(facebookBtn).toBeVisible();
    await expect(whatsappBtn).toBeVisible();
    await expect(emailBtn).toBeVisible();
    
    // Verify initial button styling (gray background)
    await expect(linkedInBtn).toHaveCSS('background-color', /rgb\(243, 244, 246\)|rgb\(245, 245, 245\)|rgb\(241, 245, 249\)/);
    
    // Verify buttons have border-radius (rounded corners)
    await expect(linkedInBtn).toHaveCSS('border-radius', '8px');
  });

  test('Header CTA button links to contact page', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    
    const ctaButton = page.locator('header').getByRole('link', { name: /Jetzt Beratung anfragen/i });
    await ctaButton.click();
    
    await expect(page).toHaveURL('/contact');
  });

  test('Section divider has green accent color', async ({ page }) => {
    await page.goto('/impressum');
    await waitForAppReady(page);
    
    // Find the section divider (green bar under page title)
    const divider = page.locator('.section-divider');
    await expect(divider).toBeVisible();
    
    // Verify it has green background (#3eb489)
    await expect(divider).toHaveCSS('background-color', /rgb\(62, 180, 137\)/);
  });
});
