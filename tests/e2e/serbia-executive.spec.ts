import { test, expect } from '@playwright/test';
import { waitForAppReady, dismissToasts, dismissCookieBanner } from '../fixtures/helpers';

test.describe('Serbia Executive Access Page', () => {
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
    // Dismiss cookie consent banner to prevent it from intercepting clicks
    await page.goto('/');
    await dismissCookieBanner(page);
  });

  test('should render Serbia Executive page correctly at /serbia-executive', async ({ page }) => {
    await page.goto('/serbia-executive');
    await waitForAppReady(page);
    
    // Verify page renders with main test id
    await expect(page.getByTestId('serbia-executive-page')).toBeVisible();
    
    // Verify hero section content
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Serbia');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Executive');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Access');
  });

  test('should display Serbia Executive navigation link with exclusive badge in header', async ({ page }) => {
    await page.goto('/serbia-executive');
    await waitForAppReady(page);
    
    // Verify the navigation link with exclusive styling
    const navLink = page.getByTestId('nav-serbia-executive');
    await expect(navLink).toBeVisible();
    // Note: Nav text is uppercase "SERBIA EXECUTIVE" in header
    await expect(navLink).toContainText('SERBIA EXECUTIVE');
  });

  test('should have video element present and functional', async ({ page }) => {
    await page.goto('/serbia-executive');
    await waitForAppReady(page);
    
    // Verify video element exists
    const video = page.getByTestId('intro-video');
    await expect(video).toBeVisible();
    
    // Verify video has controls attribute
    await expect(video).toHaveAttribute('controls');
    
    // Verify video has a source
    const videoSrc = await video.getAttribute('src');
    const sourceTag = page.locator('video[data-testid="intro-video"] source');
    const sourceSrc = await sourceTag.getAttribute('src');
    
    expect(sourceSrc || videoSrc).toBeTruthy();
  });

  test('should display Government Relations service section', async ({ page }) => {
    await page.goto('/serbia-executive');
    await waitForAppReady(page);
    
    // Find Government Relations section
    const govSection = page.getByTestId('service-government');
    await expect(govSection).toBeVisible();
    
    // Verify section content
    await expect(govSection.getByRole('heading', { name: /Government Relations/i })).toBeVisible();
    await expect(govSection).toContainText('Ministerium für Wirtschaft');
    await expect(govSection).toContainText('Investment & Export Agentur');
  });

  test('should display Infrastructure & PPP service section', async ({ page }) => {
    await page.goto('/serbia-executive');
    await waitForAppReady(page);
    
    // Find Infrastructure & PPP section
    const infraSection = page.getByTestId('service-infrastructure');
    await expect(infraSection).toBeVisible();
    
    // Verify section content
    await expect(infraSection.getByRole('heading', { name: /Infrastructure & PPP/i })).toBeVisible();
    await expect(infraSection).toContainText('Verkehr & Logistik');
    await expect(infraSection).toContainText('Energie & Utilities');
  });

  test('should display Incentives & Subsidies service section', async ({ page }) => {
    await page.goto('/serbia-executive');
    await waitForAppReady(page);
    
    // Find Incentives & Subsidies section
    const incentivesSection = page.getByTestId('service-incentives');
    await expect(incentivesSection).toBeVisible();
    
    // Verify section content
    await expect(incentivesSection.getByRole('heading', { name: /Incentives & Subsidies/i })).toBeVisible();
    await expect(incentivesSection).toContainText('15%');
    await expect(incentivesSection).toContainText('Corporate Tax');
  });

  test('should display Executive Inquiry form with all fields', async ({ page }) => {
    await page.goto('/serbia-executive');
    await waitForAppReady(page);
    
    // Scroll to form section
    await page.getByTestId('inquiry-name').scrollIntoViewIfNeeded();
    
    // Verify all form fields are present
    await expect(page.getByTestId('inquiry-name')).toBeVisible();
    await expect(page.getByTestId('inquiry-company')).toBeVisible();
    await expect(page.getByTestId('inquiry-email')).toBeVisible();
    await expect(page.getByTestId('inquiry-phone')).toBeVisible();
    await expect(page.getByTestId('inquiry-interest')).toBeVisible();
    await expect(page.getByTestId('inquiry-message')).toBeVisible();
    await expect(page.getByTestId('inquiry-submit')).toBeVisible();
  });

  test('should submit Executive Inquiry form and show success message (MOCKED)', async ({ page }) => {
    await page.goto('/serbia-executive');
    await waitForAppReady(page);
    
    // Scroll to form
    await page.getByTestId('inquiry-name').scrollIntoViewIfNeeded();
    
    // Fill out the form
    await page.getByTestId('inquiry-name').fill('TEST_John Doe');
    await page.getByTestId('inquiry-company').fill('TEST_Company GmbH');
    await page.getByTestId('inquiry-email').fill('test@example.com');
    await page.getByTestId('inquiry-phone').fill('+49 123 456789');
    await page.getByTestId('inquiry-interest').selectOption('infrastructure');
    await page.getByTestId('inquiry-message').fill('TEST_Message: Interested in Infrastructure projects');
    
    // Submit the form
    await page.getByTestId('inquiry-submit').click();
    
    // Wait for success message - the form simulates submission (MOCKED)
    await expect(page.getByText('Anfrage erhalten')).toBeVisible();
    await expect(page.getByText(/24 Stunden/i)).toBeVisible();
  });

  test('should display Share buttons section with all social platforms', async ({ page }) => {
    await page.goto('/serbia-executive');
    await waitForAppReady(page);
    
    // Scroll to share buttons
    const shareSection = page.getByTestId('share-buttons');
    await shareSection.scrollIntoViewIfNeeded();
    
    await expect(shareSection).toBeVisible();
    
    // Verify all share buttons are present
    await expect(page.getByTestId('share-linkedin')).toBeVisible();
    await expect(page.getByTestId('share-twitter')).toBeVisible();
    await expect(page.getByTestId('share-facebook')).toBeVisible();
    await expect(page.getByTestId('share-whatsapp')).toBeVisible();
    await expect(page.getByTestId('share-email')).toBeVisible();
  });

  test('should display Comments section with form', async ({ page }) => {
    await page.goto('/serbia-executive');
    await waitForAppReady(page);
    
    // Scroll to comments section
    const commentsSection = page.getByTestId('comments-section');
    await commentsSection.scrollIntoViewIfNeeded();
    
    await expect(commentsSection).toBeVisible();
    
    // Verify Comments form is present
    const commentForm = page.getByTestId('comment-form');
    await expect(commentForm).toBeVisible();
    
    // Verify form fields
    await expect(page.getByTestId('comment-name-input')).toBeVisible();
    await expect(page.getByTestId('comment-email-input')).toBeVisible();
    await expect(page.getByTestId('comment-content-input')).toBeVisible();
    await expect(page.getByTestId('comment-submit-button')).toBeVisible();
  });

  test('should submit comment and show pending moderation message', async ({ page }) => {
    const timestamp = Date.now();
    
    await page.goto('/serbia-executive');
    await waitForAppReady(page);
    
    // Scroll to comments section
    const commentForm = page.getByTestId('comment-form');
    await commentForm.scrollIntoViewIfNeeded();
    
    // Fill out comment form
    await page.getByTestId('comment-name-input').fill(`TEST_User_${timestamp}`);
    await page.getByTestId('comment-email-input').fill('test@example.com');
    await page.getByTestId('comment-content-input').fill(`TEST_Comment for Serbia Executive page ${timestamp}`);
    
    // Submit the comment
    await page.getByTestId('comment-submit-button').click();
    
    // BUG FIX VERIFIED: Comment submission now works correctly
    // SerbiaExecutivePage now passes articleId={999} and articleSlug="serbia-executive-access"
    // API uses slug-based endpoint for articles with ID >= 900
    await expect(page.getByText(/nach Prüfung|Vielen Dank/i)).toBeVisible();
  });

  test('should load existing approved comments using slug-based retrieval', async ({ page }) => {
    await page.goto('/serbia-executive');
    await waitForAppReady(page);
    
    // Scroll to comments section
    const commentsSection = page.getByTestId('comments-section');
    await commentsSection.scrollIntoViewIfNeeded();
    
    // Wait for loading to complete
    await page.waitForTimeout(2000);
    
    // Check if comments list is visible (even if empty shows "Noch keine Kommentare" or a list)
    await expect(commentsSection).toBeVisible();
    
    // The page should load without errors - either showing comments list or empty message
    // Use separate locators and check for either
    const commentsList = page.getByTestId('comments-list');
    const emptyMessage = page.getByText('Noch keine Kommentare');
    
    // One of these should be visible
    const listVisible = await commentsList.isVisible().catch(() => false);
    const emptyVisible = await emptyMessage.isVisible().catch(() => false);
    
    expect(listVisible || emptyVisible).toBeTruthy();
  });

  test('should have clickable Executive Inquiry CTA button in hero', async ({ page }) => {
    await page.goto('/serbia-executive');
    await waitForAppReady(page);
    
    // Find and click the Executive Inquiry CTA
    const ctaButton = page.getByTestId('executive-inquiry-cta');
    await expect(ctaButton).toBeVisible();
    
    // Click and verify it scrolls to the form
    await ctaButton.click();
    
    // After clicking, the inquiry form should be in view
    await expect(page.getByTestId('inquiry-name')).toBeInViewport();
  });

  test('should display trust indicators with statistics', async ({ page }) => {
    await page.goto('/serbia-executive');
    await waitForAppReady(page);
    
    // Verify trust indicators are visible - use .first() to avoid strict mode error
    await expect(page.getByText('15+', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Jahre Erfahrung')).toBeVisible();
    await expect(page.getByText('€500M+')).toBeVisible();
    await expect(page.getByText('120+')).toBeVisible();
    await expect(page.getByText('Executive Clients')).toBeVisible();
  });
});
