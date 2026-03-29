/**
 * GDPR Compliance Tests
 * Tests for Cookie Consent Banner and Contact Form Privacy Consent
 */
import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.REACT_APP_BACKEND_URL || 'https://roi-calc-preview.preview.emergentagent.com';
const COOKIE_CONSENT_KEY = 'euroadria_cookie_consent';

test.describe('Cookie Consent Banner', () => {
  
  test.beforeEach(async ({ page }) => {
    // Clear cookie consent from localStorage before each test
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate((key) => localStorage.removeItem(key), COOKIE_CONSENT_KEY);
  });

  test('Cookie banner appears on first visit', async ({ page }) => {
    // Navigate fresh (consent cleared)
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Wait for the banner to appear (has 1 second delay in component)
    await expect(page.getByTestId('cookie-consent-banner')).toBeVisible();
    
    // Verify banner title is present
    await expect(page.getByText('Cookie-Einstellungen')).toBeVisible();
  });

  test('Cookie banner has 3 main options: Accept All, Accept Necessary, Customize', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Wait for banner
    await expect(page.getByTestId('cookie-consent-banner')).toBeVisible();
    
    // Check all 3 buttons are present
    await expect(page.getByTestId('cookie-accept-all-main')).toBeVisible();
    await expect(page.getByTestId('cookie-accept-all-main')).toHaveText('Alle akzeptieren');
    
    await expect(page.getByTestId('cookie-accept-necessary')).toBeVisible();
    await expect(page.getByTestId('cookie-accept-necessary')).toHaveText('Nur notwendige');
    
    await expect(page.getByTestId('cookie-show-details')).toBeVisible();
    await expect(page.getByTestId('cookie-show-details')).toHaveText('Einstellungen anpassen');
  });

  test('Accept All saves all cookie preferences to localStorage', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Wait for banner
    await expect(page.getByTestId('cookie-consent-banner')).toBeVisible();
    
    // Click Accept All
    await page.getByTestId('cookie-accept-all-main').click();
    
    // Banner should disappear
    await expect(page.getByTestId('cookie-consent-banner')).not.toBeVisible();
    
    // Check localStorage
    const consent = await page.evaluate((key) => {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    }, COOKIE_CONSENT_KEY);
    
    expect(consent).not.toBeNull();
    expect(consent.necessary).toBe(true);
    expect(consent.analytics).toBe(true);
    expect(consent.marketing).toBe(true);
    expect(consent.version).toBe('1.0');
    expect(consent.timestamp).toBeDefined();
  });

  test('Accept Necessary saves only necessary cookies', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Wait for banner
    await expect(page.getByTestId('cookie-consent-banner')).toBeVisible();
    
    // Click Accept Necessary
    await page.getByTestId('cookie-accept-necessary').click();
    
    // Banner should disappear
    await expect(page.getByTestId('cookie-consent-banner')).not.toBeVisible();
    
    // Check localStorage
    const consent = await page.evaluate((key) => {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    }, COOKIE_CONSENT_KEY);
    
    expect(consent).not.toBeNull();
    expect(consent.necessary).toBe(true);
    expect(consent.analytics).toBe(false);
    expect(consent.marketing).toBe(false);
  });

  test('Customize shows detailed cookie options', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Wait for banner
    await expect(page.getByTestId('cookie-consent-banner')).toBeVisible();
    
    // Click Customize
    await page.getByTestId('cookie-show-details').click();
    
    // Detailed options should appear
    await expect(page.getByText('Notwendige Cookies')).toBeVisible();
    await expect(page.getByText('Analyse-Cookies')).toBeVisible();
    await expect(page.getByText('Marketing-Cookies')).toBeVisible();
    
    // Analytics and Marketing toggles should be visible
    await expect(page.getByTestId('analytics-cookie-toggle')).toBeVisible();
    await expect(page.getByTestId('marketing-cookie-toggle')).toBeVisible();
    
    // Save preferences button should appear
    await expect(page.getByTestId('cookie-save-preferences')).toBeVisible();
  });

  test('Custom cookie preferences can be saved', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Wait for banner and open details
    await expect(page.getByTestId('cookie-consent-banner')).toBeVisible();
    await page.getByTestId('cookie-show-details').click();
    
    // Enable only analytics, keep marketing disabled
    // The checkbox is hidden (sr-only), so we need to click on the label which contains the toggle
    await page.getByTestId('analytics-cookie-toggle').click({ force: true });
    
    // Save preferences
    await page.getByTestId('cookie-save-preferences').click();
    
    // Banner should disappear
    await expect(page.getByTestId('cookie-consent-banner')).not.toBeVisible();
    
    // Check localStorage
    const consent = await page.evaluate((key) => {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    }, COOKIE_CONSENT_KEY);
    
    expect(consent).not.toBeNull();
    expect(consent.necessary).toBe(true);
    expect(consent.analytics).toBe(true);
    expect(consent.marketing).toBe(false);
  });

  test('Cookie banner does not appear after consent is given', async ({ page }) => {
    // First visit - give consent
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('cookie-consent-banner')).toBeVisible();
    await page.getByTestId('cookie-accept-all-main').click();
    await expect(page.getByTestId('cookie-consent-banner')).not.toBeVisible();
    
    // Refresh page - banner should not appear
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500); // Wait longer than the banner delay (1s)
    
    // Banner should still not be visible
    await expect(page.getByTestId('cookie-consent-banner')).not.toBeVisible();
  });

  test('Privacy link in cookie banner navigates to Datenschutz page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Wait for banner
    await expect(page.getByTestId('cookie-consent-banner')).toBeVisible();
    
    // Click privacy link
    const privacyLink = page.getByTestId('cookie-privacy-link');
    await expect(privacyLink).toBeVisible();
    await expect(privacyLink).toHaveText('Datenschutzerklärung');
    
    // Click and verify navigation
    await privacyLink.click();
    await expect(page).toHaveURL(/.*\/datenschutz/);
  });

  test('Closing banner via X button accepts only necessary cookies', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Wait for banner
    await expect(page.getByTestId('cookie-consent-banner')).toBeVisible();
    
    // Click the X button (close button)
    await page.getByRole('button', { name: 'Schließen' }).click();
    
    // Banner should disappear
    await expect(page.getByTestId('cookie-consent-banner')).not.toBeVisible();
    
    // Check localStorage - should have necessary only (same as "Nur notwendige")
    const consent = await page.evaluate((key) => {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    }, COOKIE_CONSENT_KEY);
    
    expect(consent).not.toBeNull();
    expect(consent.necessary).toBe(true);
    expect(consent.analytics).toBe(false);
    expect(consent.marketing).toBe(false);
  });
});

test.describe('Contact Form Privacy Consent', () => {
  
  test.beforeEach(async ({ page }) => {
    // Accept cookies first to dismiss the banner, then go to contact
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Set consent in localStorage to avoid banner
    await page.evaluate((key) => {
      localStorage.setItem(key, JSON.stringify({
        necessary: true,
        analytics: false,
        marketing: false,
        timestamp: new Date().toISOString(),
        version: '1.0'
      }));
    }, COOKIE_CONSENT_KEY);
    
    await page.goto('/contact', { waitUntil: 'domcontentloaded' });
  });

  test('Contact form has privacy consent checkbox', async ({ page }) => {
    // Check that privacy consent checkbox is present
    const privacyCheckbox = page.getByTestId('contact-privacy-consent');
    await expect(privacyCheckbox).toBeVisible();
    
    // Check that it's unchecked by default
    await expect(privacyCheckbox).not.toBeChecked();
  });

  test('Submit button is disabled until privacy consent is checked', async ({ page }) => {
    const submitButton = page.getByTestId('contact-submit-button');
    const privacyCheckbox = page.getByTestId('contact-privacy-consent');
    
    // Initially button should be disabled (gray styling)
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeDisabled();
    
    // Check the privacy consent
    await privacyCheckbox.check();
    await expect(privacyCheckbox).toBeChecked();
    
    // Now button should be enabled
    await expect(submitButton).toBeEnabled();
  });

  test('Submit button becomes disabled again when privacy consent is unchecked', async ({ page }) => {
    const submitButton = page.getByTestId('contact-submit-button');
    const privacyCheckbox = page.getByTestId('contact-privacy-consent');
    
    // Check the privacy consent
    await privacyCheckbox.check();
    await expect(submitButton).toBeEnabled();
    
    // Uncheck the privacy consent
    await privacyCheckbox.uncheck();
    await expect(submitButton).toBeDisabled();
  });

  test('Privacy consent checkbox has link to Datenschutz page', async ({ page }) => {
    // Find the link within the privacy consent section
    const privacyLink = page.locator('[data-testid="contact-privacy-consent"]').locator('..').locator('a');
    await expect(privacyLink).toBeVisible();
    await expect(privacyLink).toHaveText('Datenschutzerklärung');
    await expect(privacyLink).toHaveAttribute('href', '/datenschutz');
  });

  test('Contact form can be submitted after privacy consent', async ({ page }) => {
    // Fill out the form
    await page.getByTestId('contact-name-input').fill('Test User');
    await page.getByTestId('contact-email-input').fill('test@example.com');
    await page.getByTestId('contact-phone-input').fill('+49 123 456789');
    await page.getByTestId('contact-subject-input').fill('Test Subject');
    await page.getByTestId('contact-message-input').fill('This is a test message for GDPR compliance testing.');
    
    // Check privacy consent
    await page.getByTestId('contact-privacy-consent').check();
    
    // Submit should be enabled
    const submitButton = page.getByTestId('contact-submit-button');
    await expect(submitButton).toBeEnabled();
    
    // Click submit
    await submitButton.click();
    
    // Check for success message (form shows "Vielen Dank" message after submission)
    await expect(page.getByText('Vielen Dank für Ihre Nachricht')).toBeVisible();
  });

  test('Form fields are all present and functional', async ({ page }) => {
    // Verify all form fields exist and can be interacted with
    await expect(page.getByTestId('contact-name-input')).toBeVisible();
    await expect(page.getByTestId('contact-email-input')).toBeVisible();
    await expect(page.getByTestId('contact-phone-input')).toBeVisible();
    await expect(page.getByTestId('contact-subject-input')).toBeVisible();
    await expect(page.getByTestId('contact-message-input')).toBeVisible();
    await expect(page.getByTestId('contact-privacy-consent')).toBeVisible();
    await expect(page.getByTestId('contact-submit-button')).toBeVisible();
    
    // Fill all fields
    await page.getByTestId('contact-name-input').fill('Max Mustermann');
    await page.getByTestId('contact-email-input').fill('max@example.de');
    await page.getByTestId('contact-subject-input').fill('Investment Anfrage');
    await page.getByTestId('contact-message-input').fill('Ich interessiere mich für Immobilien in Montenegro.');
    
    // Verify values
    await expect(page.getByTestId('contact-name-input')).toHaveValue('Max Mustermann');
    await expect(page.getByTestId('contact-email-input')).toHaveValue('max@example.de');
  });
});

test.describe('GDPR Integration - Cookie and Contact Flow', () => {
  
  test('Complete GDPR flow: Accept cookies then submit contact form', async ({ page }) => {
    // Start fresh - clear localStorage
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate((key) => localStorage.removeItem(key), COOKIE_CONSENT_KEY);
    
    // Reload to trigger cookie banner
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Accept cookies
    await expect(page.getByTestId('cookie-consent-banner')).toBeVisible();
    await page.getByTestId('cookie-accept-all-main').click();
    await expect(page.getByTestId('cookie-consent-banner')).not.toBeVisible();
    
    // Navigate to contact page
    await page.goto('/contact', { waitUntil: 'domcontentloaded' });
    
    // Cookie banner should NOT appear (consent already given)
    await page.waitForTimeout(1500);
    await expect(page.getByTestId('cookie-consent-banner')).not.toBeVisible();
    
    // Fill and submit contact form with privacy consent
    await page.getByTestId('contact-name-input').fill('GDPR Test User');
    await page.getByTestId('contact-email-input').fill('gdpr.test@example.com');
    await page.getByTestId('contact-subject-input').fill('GDPR Integration Test');
    await page.getByTestId('contact-message-input').fill('Testing complete GDPR flow.');
    
    await page.getByTestId('contact-privacy-consent').check();
    await page.getByTestId('contact-submit-button').click();
    
    // Verify success
    await expect(page.getByText('Vielen Dank für Ihre Nachricht')).toBeVisible();
  });
});
