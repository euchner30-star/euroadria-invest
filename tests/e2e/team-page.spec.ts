import { test, expect } from '@playwright/test';
import { waitForAppReady, dismissToasts, adminLogin } from '../fixtures/helpers';

test.describe('Team Page - CMS Content Display', () => {
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
  });

  test('Team page loads and displays team members', async ({ page }) => {
    await page.goto('/team');
    await waitForAppReady(page);
    
    // Wait for loading spinner to disappear
    await expect(page.locator('.animate-spin').first()).not.toBeVisible({ timeout: 10000 });
    
    // Page header should be visible - use specific heading level to avoid strict mode
    await expect(page.getByRole('heading', { name: /Unser Team Task Force/i, level: 2 })).toBeVisible();
    
    // Team members should be visible
    await expect(page.getByText('Holger Kuhlmann')).toBeVisible();
    await expect(page.getByText('Milena Bubanja')).toBeVisible();
  });

  test('Team page displays team photo', async ({ page }) => {
    await page.goto('/team');
    await waitForAppReady(page);
    
    // Wait for content to load
    await expect(page.locator('.animate-spin').first()).not.toBeVisible({ timeout: 10000 });
    
    // Team photo should be visible
    const teamPhoto = page.locator('img[alt*="Task Force"]').first();
    await expect(teamPhoto).toBeVisible();
  });

  test('Team member cards display images from CMS', async ({ page }) => {
    await page.goto('/team');
    await waitForAppReady(page);
    
    // Wait for content to load
    await expect(page.locator('.animate-spin').first()).not.toBeVisible({ timeout: 10000 });
    
    // Find team member images
    const holgerImage = page.locator('img[alt="Holger Kuhlmann"]').first();
    const milenaImage = page.locator('img[alt="Milena Bubanja"]').first();
    
    // Both images should be visible
    await expect(holgerImage).toBeVisible();
    await expect(milenaImage).toBeVisible();
    
    // Verify images are not broken (not showing placeholder)
    const holgerSrc = await holgerImage.getAttribute('src');
    const milenaSrc = await milenaImage.getAttribute('src');
    
    // Images should not be placeholder URLs
    expect(holgerSrc).not.toContain('placeholder');
    expect(milenaSrc).not.toContain('placeholder');
    
    // Should be actual image paths
    expect(holgerSrc).toMatch(/\.(jpg|jpeg|png|webp)/i);
    expect(milenaSrc).toMatch(/\.(jpg|jpeg|png|webp)/i);
  });

  test('Team member cards display titles from CMS', async ({ page }) => {
    await page.goto('/team');
    await waitForAppReady(page);
    
    // Wait for content to load
    await expect(page.locator('.animate-spin').first()).not.toBeVisible({ timeout: 10000 });
    
    // Titles should be displayed (these come from CMS)
    await expect(page.getByText('Geschäftsführer & Senior Berater').first()).toBeVisible();
    await expect(page.getByText('Partnerin & Lokale Expertin').first()).toBeVisible();
  });

  test('Team page shows "Why Task Force" section', async ({ page }) => {
    await page.goto('/team');
    await waitForAppReady(page);
    
    // Wait for content to load
    await expect(page.locator('.animate-spin').first()).not.toBeVisible({ timeout: 10000 });
    
    // Section header
    await expect(page.getByRole('heading', { name: /Task Force statt Makler/i })).toBeVisible();
    
    // Three reasons should be displayed
    await expect(page.getByText('Keine Interessenskonflikte')).toBeVisible();
    await expect(page.getByText('Forensische Tiefe')).toBeVisible();
    await expect(page.getByText('Bankability Guarantee')).toBeVisible();
  });

  test('Team member contact links are functional', async ({ page }) => {
    await page.goto('/team');
    await waitForAppReady(page);
    
    // Wait for content to load
    await expect(page.locator('.animate-spin').first()).not.toBeVisible({ timeout: 10000 });
    
    // Contact links should exist
    const mailtoLinks = page.locator('a[href^="mailto:"]');
    const linkedinLinks = page.locator('a[href*="linkedin"]');
    
    await expect(mailtoLinks.first()).toBeVisible();
    await expect(linkedinLinks.first()).toBeVisible();
  });

  test('Team page Lead Magnet box is visible', async ({ page }) => {
    await page.goto('/team');
    await waitForAppReady(page);
    
    // Wait for content to load
    await expect(page.locator('.animate-spin').first()).not.toBeVisible({ timeout: 10000 });
    
    // Scroll down to see the lead magnet
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Lead magnet should be visible
    await expect(page.getByText('Praxisleitfaden').first()).toBeVisible();
  });
});

test.describe('Team Page API Integration', () => {
  test('API returns team data with images', async ({ request }) => {
    const response = await request.get('/api/pages/team');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.slug).toBe('team');
    
    // Find team section
    const teamSection = data.sections.find((s: any) => s.type === 'team');
    expect(teamSection).toBeDefined();
    expect(teamSection.data.members.length).toBeGreaterThanOrEqual(2);
    
    // Each member should have an image
    for (const member of teamSection.data.members) {
      expect(member.image).toBeDefined();
      expect(member.image.length).toBeGreaterThan(0);
    }
  });

  test('Team member images are accessible', async ({ request }) => {
    // Get team page data
    const pageResponse = await request.get('/api/pages/team');
    const pageData = await pageResponse.json();
    
    const teamSection = pageData.sections.find((s: any) => s.type === 'team');
    
    // Check each image is accessible
    for (const member of teamSection.data.members) {
      const imageResponse = await request.head(member.image);
      expect(imageResponse.ok()).toBeTruthy();
    }
  });
});

test.describe('Navigation to Team Page', () => {
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
  });

  test('Can navigate to team page from header', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    
    // Click on Über uns link in header
    await page.getByRole('link', { name: /Über uns/i }).first().click();
    
    // Should be on team page
    await expect(page).toHaveURL(/\/team/);
    await expect(page.getByRole('heading', { name: /Unser Team Task Force/i, level: 2 })).toBeVisible();
  });

  test('Can navigate to team page from footer', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Click Über uns in footer
    const footerLink = page.locator('footer').getByRole('link', { name: /Über uns/i });
    await footerLink.click();
    
    // Should be on team page
    await expect(page).toHaveURL(/\/team/);
  });
});
