import { test, expect } from '@playwright/test';
import { waitForAppReady, dismissToasts, adminLogin } from '../fixtures/helpers';

test.describe('Admin Login and Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
  });

  test('Admin login page renders correctly', async ({ page }) => {
    await page.goto('/admin');
    await waitForAppReady(page);
    
    // Verify login page
    await expect(page.getByTestId('admin-login-page')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Admin.*Login/i })).toBeVisible();
    
    // Verify form fields
    await expect(page.getByTestId('admin-username-input')).toBeVisible();
    await expect(page.getByTestId('admin-password-input')).toBeVisible();
    await expect(page.getByTestId('admin-login-button')).toBeVisible();
  });

  test('Admin login with valid credentials works', async ({ page }) => {
    await page.goto('/admin');
    await waitForAppReady(page);
    
    // Fill login form
    await page.getByTestId('admin-username-input').fill('admin');
    await page.getByTestId('admin-password-input').fill('euroadria2025');
    
    // Click login
    await page.getByTestId('admin-login-button').click();
    
    // Should see dashboard
    await expect(page.getByTestId('admin-dashboard')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Admin.*Dashboard/i })).toBeVisible();
  });

  test('Admin login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/admin');
    await waitForAppReady(page);
    
    // Fill login form with wrong password
    await page.getByTestId('admin-username-input').fill('admin');
    await page.getByTestId('admin-password-input').fill('wrongpassword');
    
    // Click login
    await page.getByTestId('admin-login-button').click();
    
    // Should show error message
    await expect(page.getByText(/Ungültige Zugangsdaten|Anmeldung fehlgeschlagen/)).toBeVisible();
    
    // Should still be on login page
    await expect(page.getByTestId('admin-login-page')).toBeVisible();
  });

  test('Admin dashboard displays all articles', async ({ page }) => {
    // Login first
    await adminLogin(page, 'admin', 'euroadria2025');
    
    // Verify dashboard
    await expect(page.getByTestId('admin-dashboard')).toBeVisible();
    
    // Verify articles count is displayed - use getByTestId to avoid ambiguity
    await expect(page.getByTestId('tab-articles')).toBeVisible();
    
    // Verify article rows exist (check for at least one)
    const articleRows = page.locator('[data-testid^="article-row-"]');
    await expect(articleRows.first()).toBeVisible();
    
    // Should have multiple articles
    const count = await articleRows.count();
    expect(count).toBeGreaterThanOrEqual(15);
    
    // Verify create button exists
    await expect(page.getByTestId('create-article-button')).toBeVisible();
  });

  test('Create article button opens editor', async ({ page }) => {
    await adminLogin(page, 'admin', 'euroadria2025');
    
    // Click create article button
    await page.getByTestId('create-article-button').click();
    
    // Should see editor
    await expect(page.getByTestId('admin-editor')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Neuer Artikel' })).toBeVisible();
  });

  test('Edit article button opens editor', async ({ page }) => {
    await adminLogin(page, 'admin', 'euroadria2025');
    
    // Click edit button on first article
    await page.locator('[data-testid^="edit-article-"]').first().click();
    
    // Should see editor
    await expect(page.getByTestId('admin-editor')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Artikel bearbeiten' })).toBeVisible();
  });

  test('Logout from admin dashboard works', async ({ page }) => {
    await adminLogin(page, 'admin', 'euroadria2025');
    
    // Verify dashboard is visible
    await expect(page.getByTestId('admin-dashboard')).toBeVisible();
    
    // Click logout
    await page.getByRole('button', { name: /Abmelden/ }).click();
    
    // Should be back on login page
    await expect(page.getByTestId('admin-login-page')).toBeVisible();
  });
});
