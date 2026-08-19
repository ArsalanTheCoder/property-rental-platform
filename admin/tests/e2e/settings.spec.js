import { test, expect } from '@playwright/test'

const ADMIN_EMAIL = 'admin@rental.com'
const ADMIN_PASSWORD = 'admin123'

async function login(page, password = ADMIN_PASSWORD) {
  await page.goto('/login')
  await page.getByLabel(/email or username/i).fill(ADMIN_EMAIL)
  await page.getByLabel(/password/i).fill(password)
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page).toHaveURL(/\/dashboard/)
}

test('a successful mock password change shows feedback and the new password signs in within the session', async ({ page }) => {
  const NEW_PASSWORD = 'admin456'
  await login(page)
  await page.goto('/settings')

  await page.getByLabel('Current password', { exact: true }).fill(ADMIN_PASSWORD)
  await page.getByLabel('New password', { exact: true }).fill(NEW_PASSWORD)
  await page.getByLabel('Confirm new password', { exact: true }).fill(NEW_PASSWORD)
  await page.getByRole('button', { name: /change password/i }).click()

  await expect(page.getByText('Password changed successfully.')).toBeVisible()

  await page.getByRole('button', { name: /log out/i }).click()
  await expect(page).toHaveURL(/\/login/)

  // The in-memory mock persists within this page session (no full reload),
  // so the new password authenticates until the page reloads.
  await page.getByLabel(/email or username/i).fill(ADMIN_EMAIL)
  await page.getByLabel(/password/i).fill(NEW_PASSWORD)
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page).toHaveURL(/\/dashboard/)
  await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
})

test('unauthenticated visitors are redirected away from /settings', async ({ page }) => {
  await page.goto('/settings')
  await expect(page).toHaveURL(/\/login/)
})

test('an authenticated admin can open Settings and see account information', async ({ page }) => {
  await login(page)
  await page.goto('/settings')

  await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible()
  await expect(page.getByRole('main').getByText('Property Admin')).toBeVisible()
  await expect(page.getByRole('main').getByText(ADMIN_EMAIL)).toBeVisible()
  await expect(page.getByLabel('Current password', { exact: true })).toBeVisible()
  await expect(page.getByLabel('New password', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Confirm new password', { exact: true })).toBeVisible()
})

test('change-password form validates required fields and password mismatch', async ({ page }) => {
  await login(page)
  await page.goto('/settings')

  await page.getByRole('button', { name: /change password/i }).click()
  await expect(page.getByText('This field is required.')).toHaveCount(3)

  await page.getByLabel('Current password', { exact: true }).fill(ADMIN_PASSWORD)
  await page.getByLabel('New password', { exact: true }).fill('password1')
  await page.getByLabel('Confirm new password', { exact: true }).fill('password2')
  await page.getByRole('button', { name: /change password/i }).click()
  await expect(page.getByText('Passwords do not match.')).toBeVisible()

  await page.getByLabel('Current password', { exact: true }).fill(ADMIN_PASSWORD)
  await page.getByLabel('New password', { exact: true }).fill('short')
  await page.getByLabel('Confirm new password', { exact: true }).fill('short')
  await page.getByRole('button', { name: /change password/i }).click()
  await expect(page.getByText('Password must be at least 8 characters.')).toBeVisible()
})

test('unknown routes show the not-found page instead of a 404 crash', async ({ page }) => {
  await login(page)

  await page.goto('/does-not-exist')
  await expect(page.getByText('This page is not available yet.')).toBeVisible()
  await page.getByRole('link', { name: /back to dashboard/i }).click()
  await expect(page).toHaveURL(/\/dashboard/)
})
