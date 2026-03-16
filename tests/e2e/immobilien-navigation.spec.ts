import { test, expect } from '@playwright/test';
import { waitForAppReady, dismissToasts, dismissCookieBanner } from '../fixtures/helpers';

test.describe('Immobilienangebot Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
    // Dismiss cookie consent banner to prevent it from intercepting clicks
    await page.goto('/');
    await dismissCookieBanner(page);
  });

  // Desktop Navigation Tests
  test.describe('Desktop Navigation', () => {
    test('should display Immobilienangebot dropdown button with correct styling', async ({ page }) => {
      await page.goto('/');
      await waitForAppReady(page);
      
      const dropdownButton = page.getByTestId('nav-immobilien-dropdown');
      await expect(dropdownButton).toBeVisible();
      await expect(dropdownButton).toContainText('IMMOBILIENANGEBOT');
    });

    test('should open dropdown on hover and display all 5 regions including Podgorica', async ({ page }) => {
      await page.goto('/');
      await waitForAppReady(page);
      
      const dropdownButton = page.getByTestId('nav-immobilien-dropdown');
      await dropdownButton.hover();
      await page.waitForTimeout(500);
      
      // Verify dropdown is visible and contains all 5 regions (including Podgorica)
      await expect(page.getByTestId('nav-immobilien-skadar-lake')).toBeVisible();
      await expect(page.getByTestId('nav-immobilien-žabljak')).toBeVisible();
      await expect(page.getByTestId('nav-immobilien-budva')).toBeVisible();
      await expect(page.getByTestId('nav-immobilien-nikšić')).toBeVisible();
      await expect(page.getByTestId('nav-immobilien-podgorica')).toBeVisible();
    });

    test('should open dropdown on click', async ({ page }) => {
      await page.goto('/');
      await waitForAppReady(page);
      
      const dropdownButton = page.getByTestId('nav-immobilien-dropdown');
      await dropdownButton.click();
      await page.waitForTimeout(300);
      
      // Verify dropdown is open - check for region links
      await expect(page.getByTestId('nav-immobilien-skadar-lake')).toBeVisible();
    });

    test('should navigate to Skadar-Lake page from dropdown', async ({ page }) => {
      await page.goto('/');
      await waitForAppReady(page);
      
      const dropdownButton = page.getByTestId('nav-immobilien-dropdown');
      await dropdownButton.hover();
      await page.waitForTimeout(500);
      
      await page.getByTestId('nav-immobilien-skadar-lake').click();
      await waitForAppReady(page);
      
      await expect(page).toHaveURL(/.*\/immobilien\/skadar-lake/);
      await expect(page.getByTestId('skadar-lake-page')).toBeVisible();
    });

    test('should navigate to Žabljak page from dropdown', async ({ page }) => {
      await page.goto('/');
      await waitForAppReady(page);
      
      const dropdownButton = page.getByTestId('nav-immobilien-dropdown');
      await dropdownButton.hover();
      await page.waitForTimeout(500);
      
      await page.getByTestId('nav-immobilien-žabljak').click();
      await waitForAppReady(page);
      
      await expect(page).toHaveURL(/.*\/immobilien\/zabljak/);
      await expect(page.getByTestId('zabljak-page')).toBeVisible();
    });

    test('should navigate to Budva page from dropdown', async ({ page }) => {
      await page.goto('/');
      await waitForAppReady(page);
      
      const dropdownButton = page.getByTestId('nav-immobilien-dropdown');
      await dropdownButton.hover();
      await page.waitForTimeout(500);
      
      await page.getByTestId('nav-immobilien-budva').click();
      await waitForAppReady(page);
      
      await expect(page).toHaveURL(/.*\/immobilien\/budva/);
      await expect(page.getByTestId('budva-page')).toBeVisible();
    });

    test('should navigate to Nikšić page from dropdown', async ({ page }) => {
      await page.goto('/');
      await waitForAppReady(page);
      
      const dropdownButton = page.getByTestId('nav-immobilien-dropdown');
      await dropdownButton.hover();
      await page.waitForTimeout(500);
      
      await page.getByTestId('nav-immobilien-nikšić').click();
      await waitForAppReady(page);
      
      await expect(page).toHaveURL(/.*\/immobilien\/niksic/);
      await expect(page.getByTestId('niksic-page')).toBeVisible();
    });

    test('should highlight dropdown when on immobilien page', async ({ page }) => {
      await page.goto('/immobilien/skadar-lake');
      await waitForAppReady(page);
      
      const dropdownButton = page.getByTestId('nav-immobilien-dropdown');
      // Check that the dropdown has the active styling (gold color)
      await expect(dropdownButton).toHaveClass(/text-ea-gold/);
    });

    test('should navigate to Podgorica page from dropdown', async ({ page }) => {
      await page.goto('/');
      await waitForAppReady(page);
      
      const dropdownButton = page.getByTestId('nav-immobilien-dropdown');
      await dropdownButton.hover();
      await page.waitForTimeout(500);
      
      await page.getByTestId('nav-immobilien-podgorica').click();
      await waitForAppReady(page);
      
      await expect(page).toHaveURL(/.*\/immobilien\/podgorica/);
      await expect(page.getByTestId('podgorica-page')).toBeVisible();
    });

    test('should display correct navigation order: HOME -> IMMOBILIENANGEBOT -> INFRASTRUKTUR-RADAR', async ({ page }) => {
      await page.goto('/');
      await waitForAppReady(page);
      
      // Verify HOME link is visible
      await expect(page.getByTestId('nav-home')).toBeVisible();
      await expect(page.getByTestId('nav-home')).toContainText('HOME');
      
      // Verify IMMOBILIENANGEBOT dropdown is visible
      await expect(page.getByTestId('nav-immobilien-dropdown')).toBeVisible();
      
      // Verify INFRASTRUKTUR-RADAR is visible with NEU badge
      await expect(page.getByTestId('nav-infrastruktur-radar')).toBeVisible();
      await expect(page.getByTestId('nav-infrastruktur-radar')).toContainText('INFRASTRUKTUR-RADAR');
      await expect(page.getByTestId('nav-infrastruktur-radar')).toContainText('NEU');
    });
  });

  // Mobile Navigation Tests
  test.describe('Mobile Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
    });

    test('should display mobile menu toggle button', async ({ page }) => {
      await page.goto('/');
      await waitForAppReady(page);
      
      const menuButton = page.locator('button[aria-label="Toggle menu"]');
      await expect(menuButton).toBeVisible();
    });

    test('should open mobile menu and show Immobilienangebot accordion', async ({ page }) => {
      await page.goto('/');
      await waitForAppReady(page);
      
      // Open mobile menu
      await page.locator('button[aria-label="Toggle menu"]').click();
      await page.waitForTimeout(500);
      
      // Verify Immobilienangebot accordion is visible
      await expect(page.getByTestId('mobile-immobilien-dropdown')).toBeVisible();
      await expect(page.getByTestId('mobile-immobilien-dropdown')).toContainText('IMMOBILIENANGEBOT');
    });

    test('should expand Immobilienangebot accordion and show all 5 regions including Podgorica', async ({ page }) => {
      await page.goto('/');
      await waitForAppReady(page);
      
      // Open mobile menu
      await page.locator('button[aria-label="Toggle menu"]').click();
      await page.waitForTimeout(500);
      
      // Click accordion to expand
      await page.getByTestId('mobile-immobilien-dropdown').click();
      await page.waitForTimeout(300);
      
      // Verify all 5 regions are visible (including Podgorica)
      await expect(page.getByText('Skadar-Lake').first()).toBeVisible();
      await expect(page.getByText('Žabljak').first()).toBeVisible();
      await expect(page.getByText('Budva').first()).toBeVisible();
      await expect(page.getByText('Nikšić').first()).toBeVisible();
      await expect(page.getByText('Podgorica').first()).toBeVisible();
    });

    test('should navigate to region page from mobile accordion', async ({ page }) => {
      await page.goto('/');
      await waitForAppReady(page);
      
      // Open mobile menu
      await page.locator('button[aria-label="Toggle menu"]').click();
      await page.waitForTimeout(500);
      
      // Expand accordion
      await page.getByTestId('mobile-immobilien-dropdown').click();
      await page.waitForTimeout(300);
      
      // Click on Budva region - use role link inside accordion
      await page.locator('a[href="/immobilien/budva"]').first().click();
      await waitForAppReady(page);
      
      await expect(page).toHaveURL(/.*\/immobilien\/budva/);
    });

    test('should close mobile menu when navigating to a page', async ({ page }) => {
      await page.goto('/');
      await waitForAppReady(page);
      
      // Open mobile menu
      await page.locator('button[aria-label="Toggle menu"]').click();
      await page.waitForTimeout(500);
      
      // Click ÜBER UNS link from mobile menu - use getByRole with exact name
      await page.getByRole('link', { name: 'ÜBER UNS', exact: true }).click();
      await waitForAppReady(page);
      
      // Should have navigated to team page
      await expect(page).toHaveURL(/.*\/team/);
      
      // Mobile menu should be closed (accordion not visible)
      await expect(page.getByTestId('mobile-immobilien-dropdown')).not.toBeVisible();
    });
  });
});
