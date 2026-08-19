import { test, expect } from '@playwright/test'

const ADMIN_EMAIL = 'admin@rental.com'
const ADMIN_PASSWORD = 'admin123'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => window.sessionStorage.clear())
})

test('unauthenticated visitors are redirected from protected routes to login', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole('heading', { name: /property rental admin/i })).toBeVisible()
})

test('an admin can log in and reach the dashboard', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel(/email or username/i).fill(ADMIN_EMAIL)
  await page.getByLabel(/password/i).fill(ADMIN_PASSWORD)
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page).toHaveURL(/\/dashboard/)
  await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
})

test('invalid credentials show an error and do not grant access', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel(/email or username/i).fill('wrong@example.com')
  await page.getByLabel(/password/i).fill('wrong-password')
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page.getByText(/invalid email\/username or password/i)).toBeVisible()
  await expect(page).toHaveURL(/\/login/)
})

test('logging out blocks protected routes again', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel(/email or username/i).fill(ADMIN_EMAIL)
  await page.getByLabel(/password/i).fill(ADMIN_PASSWORD)
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page).toHaveURL(/\/dashboard/)

  await page.getByRole('button', { name: /log out/i }).click()
  await expect(page).toHaveURL(/\/login/)

  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/login/)
})
