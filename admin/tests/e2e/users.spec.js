import { test, expect } from '@playwright/test'

const ADMIN_EMAIL = 'admin@rental.com'
const ADMIN_PASSWORD = 'admin123'

async function login(page) {
  await page.goto('/login')
  await page.getByLabel(/email or username/i).fill(ADMIN_EMAIL)
  await page.getByLabel(/password/i).fill(ADMIN_PASSWORD)
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page).toHaveURL(/\/dashboard/)
}

test('an admin can search for a user and open their details', async ({ page }) => {
  await login(page)

  await page.goto('/users')
  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible()
  await expect(page.getByText('Alice Johnson')).toBeVisible()
  await expect(page.getByText('Bob Williams')).toBeVisible()

  await page.getByLabel(/^Search/).fill('alice')
  await page.getByRole('button', { name: 'Search' }).click()
  await expect(page.getByText('Alice Johnson')).toBeVisible()
  await expect(page.getByText('Bob Williams')).not.toBeVisible()

  await page.getByRole('link', { name: 'Alice Johnson' }).click()
  await expect(page).toHaveURL(/\/users\/user-\d+$/)
  await expect(page.getByText('alice@example.com')).toBeVisible()
  await expect(page.getByText('Favorite properties')).toBeVisible()
  await expect(page.getByText('prop-001')).toBeVisible()

  // SPA navigation back to the list keeps the in-memory mock alive.
  await page.getByRole('link', { name: /back to users/i }).click()
  await expect(page).toHaveURL(/\/users$/)
})
