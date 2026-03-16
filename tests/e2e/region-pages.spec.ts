import { test, expect } from '@playwright/test';
import { waitForAppReady, dismissToasts } from '../fixtures/helpers';

test.describe('Region Landing Pages', () => {
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
  });

  // Skadar-Lake Page Tests
  test.describe('Skadar-Lake Page', () => {
    test('should load Skadar-Lake page with correct structure', async ({ page }) => {
      await page.goto('/immobilien/skadar-lake');
      await waitForAppReady(page);
      
      // Verify page renders
      await expect(page.getByTestId('skadar-lake-page')).toBeVisible();
      
      // Verify hero content
      await expect(page.getByRole('heading', { level: 1 })).toContainText('Skadar-Lake');
      await expect(page.getByRole('heading', { level: 1 })).toContainText('Naturparadies');
    });

    test('should display Investment-Kennzahlen section with 4 metrics', async ({ page }) => {
      await page.goto('/immobilien/skadar-lake');
      await waitForAppReady(page);
      
      // Check for Investment-Kennzahlen heading
      await expect(page.getByText('Investment-Kennzahlen')).toBeVisible();
      
      // Verify key investment metrics are displayed
      await expect(page.getByText('88/100')).toBeVisible(); // Investment-Score
      await expect(page.getByText(/€800-1\.500\/m²/)).toBeVisible(); // Price
      await expect(page.getByText('3-7 Jahre')).toBeVisible(); // Zeithorizont
      await expect(page.getByText('+40-60%')).toBeVisible(); // Potenzial
    });

    test('should have clickable Exposé anfordern CTA', async ({ page }) => {
      await page.goto('/immobilien/skadar-lake');
      await waitForAppReady(page);
      
      const ctaButton = page.getByTestId('skadar-contact-cta');
      await expect(ctaButton).toBeVisible();
      await expect(ctaButton).toContainText('Exposé anfordern');
      
      // Click and verify form modal opens
      await ctaButton.click();
      await expect(page.getByText('Skadar-Lake Exposé')).toBeVisible();
    });

    test('should submit Exposé form and show success message', async ({ page }) => {
      await page.goto('/immobilien/skadar-lake');
      await waitForAppReady(page);
      
      // Open form
      await page.getByTestId('skadar-contact-cta').click();
      
      // Fill form
      await page.locator('input[placeholder="Ihr Name"]').fill('TEST_User_SkadarLake');
      await page.locator('input[placeholder*="email"]').fill('test@example.com');
      
      // Submit
      await page.getByText('Exposé anfordern', { exact: false }).last().click();
      
      // Verify success message
      await expect(page.getByText('Anfrage erhalten')).toBeVisible();
    });

    test('should display apartments section with placeholders', async ({ page }) => {
      await page.goto('/immobilien/skadar-lake');
      await waitForAppReady(page);
      
      // Scroll to apartments section
      await page.locator('#apartments').scrollIntoViewIfNeeded();
      
      // Verify placeholder cards
      await expect(page.getByTestId('apartment-placeholder-1')).toBeVisible();
      await expect(page.getByTestId('apartment-placeholder-2')).toBeVisible();
      await expect(page.getByTestId('apartment-placeholder-3')).toBeVisible();
    });
  });

  // Žabljak Page Tests
  test.describe('Žabljak Page', () => {
    test('should load Žabljak page with correct structure', async ({ page }) => {
      await page.goto('/immobilien/zabljak');
      await waitForAppReady(page);
      
      await expect(page.getByTestId('zabljak-page')).toBeVisible();
      await expect(page.getByRole('heading', { level: 1 })).toContainText('Žabljak');
      await expect(page.getByRole('heading', { level: 1 })).toContainText('Ski-Resort');
    });

    test('should display Investment-Kennzahlen with Žabljak-specific metrics', async ({ page }) => {
      await page.goto('/immobilien/zabljak');
      await waitForAppReady(page);
      
      await expect(page.getByText('91/100')).toBeVisible(); // Investment-Score
      await expect(page.getByText(/€1\.000-2\.000\/m²/)).toBeVisible(); // Price
      await expect(page.getByText('+50-80%')).toBeVisible(); // Potenzial
    });

    test('should have Exposé CTA button', async ({ page }) => {
      await page.goto('/immobilien/zabljak');
      await waitForAppReady(page);
      
      const ctaButton = page.getByTestId('zabljak-contact-cta');
      await expect(ctaButton).toBeVisible();
      await expect(ctaButton).toContainText('Exposé anfordern');
    });
  });

  // Budva Page Tests
  test.describe('Budva Page', () => {
    test('should load Budva page with correct structure', async ({ page }) => {
      await page.goto('/immobilien/budva');
      await waitForAppReady(page);
      
      await expect(page.getByTestId('budva-page')).toBeVisible();
      await expect(page.getByRole('heading', { level: 1 })).toContainText('Budva');
      await expect(page.getByRole('heading', { level: 1 })).toContainText('Küstenmetropole');
    });

    test('should display Investment-Kennzahlen with Budva-specific metrics', async ({ page }) => {
      await page.goto('/immobilien/budva');
      await waitForAppReady(page);
      
      await expect(page.getByText('82/100')).toBeVisible(); // Investment-Score
      await expect(page.getByText(/€2\.500-5\.000\/m²/)).toBeVisible(); // Price
      await expect(page.getByText('5-8%')).toBeVisible(); // Mietrendite
    });

    test('should have Exposé CTA button', async ({ page }) => {
      await page.goto('/immobilien/budva');
      await waitForAppReady(page);
      
      const ctaButton = page.getByTestId('budva-contact-cta');
      await expect(ctaButton).toBeVisible();
    });
  });

  // Nikšić Page Tests
  test.describe('Nikšić Page', () => {
    test('should load Nikšić page with correct structure', async ({ page }) => {
      await page.goto('/immobilien/niksic');
      await waitForAppReady(page);
      
      await expect(page.getByTestId('niksic-page')).toBeVisible();
      await expect(page.getByRole('heading', { level: 1 })).toContainText('Nikšić');
      await expect(page.getByRole('heading', { level: 1 })).toContainText('Industriezentrum');
    });

    test('should display Investment-Kennzahlen with Nikšić-specific metrics', async ({ page }) => {
      await page.goto('/immobilien/niksic');
      await waitForAppReady(page);
      
      await expect(page.getByText('85/100')).toBeVisible(); // Investment-Score
      await expect(page.getByText(/€600-1\.200\/m²/)).toBeVisible(); // Price
      await expect(page.getByText('+80-120%')).toBeVisible(); // Potenzial
    });

    test('should have Exposé CTA button', async ({ page }) => {
      await page.goto('/immobilien/niksic');
      await waitForAppReady(page);
      
      const ctaButton = page.getByTestId('niksic-contact-cta');
      await expect(ctaButton).toBeVisible();
    });
  });

  // Cross-page navigation
  test.describe('Cross-page Navigation', () => {
    test('should navigate from one region page to another via dropdown', async ({ page }) => {
      await page.goto('/immobilien/skadar-lake');
      await waitForAppReady(page);
      
      // Hover over dropdown and navigate to Budva
      const dropdownButton = page.getByTestId('nav-immobilien-dropdown');
      await dropdownButton.hover();
      await page.waitForTimeout(500);
      
      await page.getByTestId('nav-immobilien-budva').click();
      await waitForAppReady(page);
      
      await expect(page.getByTestId('budva-page')).toBeVisible();
    });

    test('should have link to Infrastruktur-Radar from region pages', async ({ page }) => {
      await page.goto('/immobilien/skadar-lake');
      await waitForAppReady(page);
      
      const mapLink = page.getByRole('link', { name: /Auf Karte anzeigen/i });
      await expect(mapLink).toBeVisible();
      
      await mapLink.click();
      await waitForAppReady(page);
      
      await expect(page).toHaveURL(/.*\/infrastruktur-radar/);
    });
  });

  // Podgorica Page Tests
  test.describe('Podgorica Page', () => {
    test('should load Podgorica page with correct structure', async ({ page }) => {
      await page.goto('/immobilien/podgorica');
      await waitForAppReady(page);
      
      await expect(page.getByTestId('podgorica-page')).toBeVisible();
      await expect(page.getByRole('heading', { level: 1 })).toContainText('Podgorica');
      await expect(page.getByRole('heading', { level: 1 })).toContainText('Business-Hub');
    });

    test('should display Investment-Kennzahlen with Investment-Score 90/100', async ({ page }) => {
      await page.goto('/immobilien/podgorica');
      await waitForAppReady(page);
      
      // Check for Investment-Kennzahlen section
      await expect(page.getByText('Investment-Kennzahlen')).toBeVisible();
      
      // Verify Podgorica-specific investment metrics
      await expect(page.getByText('90/100')).toBeVisible(); // Investment-Score
      await expect(page.getByText(/€1\.500-3\.000\/m²/)).toBeVisible(); // Price
      await expect(page.getByText('2-5 Jahre')).toBeVisible(); // Zeithorizont
      await expect(page.getByText('+35-55%')).toBeVisible(); // Potenzial
    });

    test('should have clickable Exposé anfordern CTA', async ({ page }) => {
      await page.goto('/immobilien/podgorica');
      await waitForAppReady(page);
      
      const ctaButton = page.getByTestId('podgorica-contact-cta');
      await expect(ctaButton).toBeVisible();
      await expect(ctaButton).toContainText('Exposé anfordern');
      
      // Click and verify form modal opens
      await ctaButton.click();
      await expect(page.getByText('Podgorica Exposé')).toBeVisible();
    });

    test('should submit Exposé form and show success message', async ({ page }) => {
      await page.goto('/immobilien/podgorica');
      await waitForAppReady(page);
      
      // Open form
      await page.getByTestId('podgorica-contact-cta').click();
      
      // Fill form
      await page.locator('input[placeholder="Ihr Name"]').fill('TEST_User_Podgorica');
      await page.locator('input[placeholder*="email"]').fill('test@example.com');
      
      // Submit
      await page.getByText('Exposé anfordern', { exact: false }).last().click();
      
      // Verify success message
      await expect(page.getByText('Anfrage erhalten')).toBeVisible();
    });

    test('should display apartments section with placeholders', async ({ page }) => {
      await page.goto('/immobilien/podgorica');
      await waitForAppReady(page);
      
      // Scroll to apartments section
      await page.locator('#apartments').scrollIntoViewIfNeeded();
      
      // Verify placeholder cards
      await expect(page.getByTestId('apartment-placeholder-1')).toBeVisible();
      await expect(page.getByTestId('apartment-placeholder-2')).toBeVisible();
      await expect(page.getByTestId('apartment-placeholder-3')).toBeVisible();
    });

    test('should show main infrastructure advantages', async ({ page }) => {
      await page.goto('/immobilien/podgorica');
      await waitForAppReady(page);
      
      // Check for key infrastructure advantages mentioned on page
      await expect(page.getByRole('heading', { name: 'Internationaler Flughafen' })).toBeVisible();
      await expect(page.getByText(/KCCG/i).first()).toBeVisible();
    });
  });
});
