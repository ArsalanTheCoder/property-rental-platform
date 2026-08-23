import { test, expect } from '@playwright/test'

const ADMIN_EMAIL = 'admin@rental.com'
const ADMIN_PASSWORD = 'admin123'

test.beforeEach(async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel(/email or username/i).fill(ADMIN_EMAIL)
  await page.getByLabel(/password/i).fill(ADMIN_PASSWORD)
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page).toHaveURL(/\/dashboard/)
})

test('desktop shows the sidebar navigation without a hamburger', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })

  await expect(page.getByRole('navigation', { name: /main navigation/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /open navigation/i })).toBeHidden()
})

test('tablet hides the sidebar behind a hamburger that opens a drawer', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 })

  await expect(page.getByRole('navigation', { name: /main navigation/i })).toBeHidden()
  const hamburger = page.getByRole('button', { name: /open navigation/i })
  await expect(hamburger).toBeVisible()

  await hamburger.click()
  await expect(page.getByRole('navigation', { name: /main navigation/i })).toBeVisible()

  await page.getByRole('link', { name: 'Properties' }).click()
  await expect(page).toHaveURL(/\/properties/)
  await expect(page.getByRole('navigation', { name: /main navigation/i })).toBeHidden()
})

test('tablet surfaces the drawer again with the hamburger after closing it', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 })

  const hamburger = page.getByRole('button', { name: /open navigation/i })
  await hamburger.click()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('navigation', { name: /main navigation/i })).toBeHidden()
})
