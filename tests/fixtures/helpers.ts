import { Page, expect } from '@playwright/test';

const COOKIE_CONSENT_KEY = 'euroadria_cookie_consent';

export async function waitForAppReady(page: Page) {
  await page.waitForLoadState('domcontentloaded');
}

export async function dismissCookieBanner(page: Page) {
  // Set cookie consent in localStorage to prevent banner from appearing
  await page.evaluate((key) => {
    localStorage.setItem(key, JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
      version: '1.0'
    }));
  }, COOKIE_CONSENT_KEY);
}

export async function dismissToasts(page: Page) {
  await page.addLocatorHandler(
    page.locator('[data-sonner-toast], .Toastify__toast, [role="status"].toast, .MuiSnackbar-root'),
    async () => {
      const close = page.locator('[data-sonner-toast] [data-close], [data-sonner-toast] button[aria-label="Close"], .Toastify__close-button, .MuiSnackbar-root button');
      await close.first().click({ timeout: 2000 }).catch(() => {});
    },
    { times: 10, noWaitAfter: true }
  );
}

export async function checkForErrors(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const errorElements = Array.from(
      document.querySelectorAll('.error, [class*="error"], [id*="error"]')
    );
    return errorElements.map(el => el.textContent || '').filter(Boolean);
  });
}

export async function adminLogin(page: Page, username: string, password: string) {
  await page.goto('/admin');
  await page.getByTestId('admin-username-input').fill(username);
  await page.getByTestId('admin-password-input').fill(password);
  await page.getByTestId('admin-login-button').click();
  // Wait for dashboard to appear
  await expect(page.getByTestId('admin-dashboard')).toBeVisible();
}

export async function navigateToPage(page: Page, path: string) {
  await page.goto(path);
  await waitForAppReady(page);
}
