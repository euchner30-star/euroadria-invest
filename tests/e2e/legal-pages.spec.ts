import { test, expect } from '@playwright/test';
import { waitForAppReady, dismissToasts } from '../fixtures/helpers';

test.describe('Legal Pages - Impressum and Datenschutz', () => {
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
  });

  test('Impressum page renders with required content', async ({ page }) => {
    await page.goto('/impressum');
    await waitForAppReady(page);
    
    // Verify page is loaded
    await expect(page.getByTestId('impressum-page')).toBeVisible();
    
    // Verify main heading
    await expect(page.getByRole('heading', { name: 'Impressum', exact: true })).toBeVisible();
    
    // Verify company info
    await expect(page.getByText('EuroAdria Corporate Solutions')).toBeVisible();
    await expect(page.getByText('Firmensitz:')).toBeVisible();
    
    // Verify German branch address (key requirement)
    await expect(page.getByRole('heading', { name: 'Niederlassung Deutschland' })).toBeVisible();
    await expect(page.getByText('Speditionsstraße 15a')).toBeVisible();
    await expect(page.getByText('40221 Düsseldorf')).toBeVisible();
    
    // Verify responsible person (Holger Kuhlmann)
    await expect(page.getByText('Verantwortlich: Holger Kuhlmann')).toBeVisible();
    
    // Verify contact info
    await expect(page.getByText('+382 68 559 776').first()).toBeVisible();
    await expect(page.getByText('office@euroadria.me').first()).toBeVisible();
    
    // Verify legal sections exist
    await expect(page.getByRole('heading', { name: 'Haftungsausschluss' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Haftung für Links' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Urheberrecht' })).toBeVisible();
  });

  test('Datenschutz page renders with required content', async ({ page }) => {
    await page.goto('/datenschutz');
    await waitForAppReady(page);
    
    // Verify page is loaded
    await expect(page.getByTestId('datenschutz-page')).toBeVisible();
    
    // Verify main heading
    await expect(page.getByRole('heading', { name: 'Datenschutzerklärung', exact: true })).toBeVisible();
    
    // Verify responsible entity section
    await expect(page.getByRole('heading', { name: '1. Verantwortliche Stelle' })).toBeVisible();
    await expect(page.getByText('EuroAdria').first()).toBeVisible();
    
    // Verify data processing sections
    await expect(page.getByRole('heading', { name: /Erhebung und Speicherung/ })).toBeVisible();
    await expect(page.getByText('Beim Besuch der Website')).toBeVisible();
    
    // Verify GDPR rights section
    await expect(page.getByRole('heading', { name: '5. Ihre Rechte' })).toBeVisible();
    await expect(page.getByText(/Art\. 15 DSGVO/)).toBeVisible();
    
    // Verify cookies section
    await expect(page.getByRole('heading', { name: /Cookies und Tracking/ })).toBeVisible();
    
    // Verify security section
    await expect(page.getByRole('heading', { name: '6. Datensicherheit' })).toBeVisible();
  });

  test('Footer links to Impressum and Datenschutz work', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    
    // Scroll to footer to ensure links are visible
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Click Impressum link in footer
    await page.getByRole('link', { name: 'Impressum' }).click();
    await expect(page).toHaveURL(/\/impressum/);
    await expect(page.getByTestId('impressum-page')).toBeVisible();
    
    // Go back and click Datenschutz link
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    await page.getByRole('link', { name: 'Datenschutz' }).click();
    await expect(page).toHaveURL(/\/datenschutz/);
    await expect(page.getByTestId('datenschutz-page')).toBeVisible();
  });
});
