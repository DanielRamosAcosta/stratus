import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Sign In with Dex' }).click();
  await page.getByPlaceholder(/email address/i).fill('john.doe@example.com');
  await page.getByPlaceholder(/password/i).fill('password');
  await page.getByRole('button', { name: /Login/i }).click();
  await page.getByRole('button', { name: /Grant Access/i }).click();

  await expect(page.getByText("Welcome to Remix")).toBeVisible();
});
