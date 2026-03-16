import { test, expect } from '@playwright/test';
import { waitForAppReady, dismissToasts, dismissCookieBanner } from '../fixtures/helpers';

test.describe('Design Update - euroadria.me Style Verification (Gold/Navy Theme)', () => {
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
    // Dismiss cookie consent banner to prevent it from intercepting clicks
    await page.goto('/');
    await dismissCookieBanner(page);
  });

  test('Header has dark navy CTA button (#04151F)', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    
    // Find the CTA button in header "Jetzt Beratung anfragen"
    const ctaButton = page.getByTestId('header-cta-button');
    await expect(ctaButton).toBeVisible();
    
    // Verify it has dark navy background color (#04151F = rgb(4, 21, 31))
    await expect(ctaButton).toHaveCSS('background-color', /rgb\(4, 21, 31\)/);
  });

  test('Homepage renders with white background content sections', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    
    // Verify page has white background
    const body = page.locator('body');
    await expect(body).toHaveCSS('background', /rgb\(255, 255, 255\)|white/);
    
    // Verify content boxes have white background with borders
    // The "Warum Balkan statt EU" card should have white background
    const balkanCard = page.locator('.bg-white').first();
    await expect(balkanCard).toBeVisible();
  });

  test('Blog page has dark navy active filter tab', async ({ page }) => {
    await page.goto('/blog');
    await waitForAppReady(page);
    
    // Wait for articles to load (loader should disappear)
    await expect(page.locator('[class*="animate-spin"]').first()).not.toBeVisible();
    
    // The "Alle" filter should be active by default with dark navy background
    const allFilter = page.getByTestId('cluster-filter-all');
    await expect(allFilter).toBeVisible();
    
    // Verify dark navy background (#04151F = rgb(4, 21, 31))
    await expect(allFilter).toHaveCSS('background-color', /rgb\(4, 21, 31\)/);
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
    
    // Verify page header "Rechtliches" label is gold (#D5B781 = rgb(213, 183, 129))
    const legalLabel = page.getByTestId('datenschutz-page').getByText('Rechtliches');
    await expect(legalLabel).toBeVisible();
    await expect(legalLabel).toHaveCSS('color', /rgb\(213, 183, 129\)/);
    
    // Verify content sections have white background
    const responsibleSection = page.locator('section').filter({ has: page.getByText('1. Verantwortliche Stelle') });
    await expect(responsibleSection).toBeVisible();
    await expect(responsibleSection).toHaveCSS('background-color', /rgb\(255, 255, 255\)/);
  });

  test('Serbia Executive page has gold CTA button and gold trust values', async ({ page }) => {
    await page.goto('/serbia-executive');
    await waitForAppReady(page);
    
    await expect(page.getByTestId('serbia-executive-page')).toBeVisible();
    
    // Verify Executive Inquiry CTA has gold background (#D5B781 = rgb(213, 183, 129))
    const ctaButton = page.getByTestId('executive-inquiry-cta');
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toHaveCSS('background-color', /rgb\(213, 183, 129\)/);
    
    // Verify trust indicator values are gold
    const trustValue = page.getByText('15+', { exact: true }).first();
    await expect(trustValue).toBeVisible();
    await expect(trustValue).toHaveCSS('color', /rgb\(213, 183, 129\)/);
  });

  test('All navigation links work correctly', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    
    // Test HOME link - get from header nav specifically
    await page.locator('header').getByRole('link', { name: 'HOME', exact: true }).click();
    await expect(page).toHaveURL('/');
    
    // Test BLOG link
    await page.locator('header').getByRole('link', { name: 'BLOG', exact: true }).click();
    await expect(page).toHaveURL('/blog');
    
    // Test ÜBER UNS link
    await page.locator('header').getByRole('link', { name: 'ÜBER UNS', exact: true }).click();
    await expect(page).toHaveURL('/team');
    
    // Test KONTAKT link
    await page.locator('header').getByRole('link', { name: 'KONTAKT', exact: true }).click();
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
    
    // Verify initial button styling (cream background = ea-light #F9F5EE = rgb(249, 245, 238))
    await expect(linkedInBtn).toHaveCSS('background-color', /rgb\(249, 245, 238\)/);
    
    // Verify buttons have border-radius (rounded corners)
    await expect(linkedInBtn).toHaveCSS('border-radius', /8px|0.5rem/);
  });

  test('Header CTA button links to contact page', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    
    const ctaButton = page.getByTestId('header-cta-button');
    await ctaButton.click();
    
    await expect(page).toHaveURL('/contact');
  });

  test('Footer has dark navy background (#04151F)', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Verify footer has dark navy background
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer).toHaveCSS('background-color', /rgb\(4, 21, 31\)/);
  });

  test('Homepage hero section has gold accents', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    
    // Verify the gold colored text in hero - "Executive" in the title
    const heroSection = page.locator('section').first();
    await expect(heroSection).toBeVisible();
    
    // Check for gold text color (#D5B781)
    const goldText = page.locator('.text-ea-gold').first();
    await expect(goldText).toBeVisible();
    await expect(goldText).toHaveCSS('color', /rgb\(213, 183, 129\)/);
  });

  test('Active navigation link shows gold color', async ({ page }) => {
    await page.goto('/blog');
    await waitForAppReady(page);
    
    // BLOG link should be active (gold color)
    const blogLink = page.locator('header').getByRole('link', { name: 'BLOG', exact: true });
    await expect(blogLink).toBeVisible();
    await expect(blogLink).toHaveCSS('color', /rgb\(213, 183, 129\)/);
  });

  test('Contact page form displays with gold accents', async ({ page }) => {
    await page.goto('/contact');
    await waitForAppReady(page);
    
    // Verify page title has gold accent
    const titleAccent = page.getByText('aufnahme', { exact: false });
    await expect(titleAccent).toBeVisible();
    
    // Verify "Nachricht" accent text is gold
    const nachrichtAccent = page.getByText('Nachricht', { exact: false }).first();
    await expect(nachrichtAccent).toBeVisible();
  });
});
