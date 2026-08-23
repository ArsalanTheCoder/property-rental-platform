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

test('an admin can open an inquiry from the list and see its details', async ({ page }) => {
  await login(page)

  await page.goto('/inquiries')
  await expect(page.getByRole('heading', { name: 'Inquiries' })).toBeVisible()
  await expect(page.getByText('Alice Johnson')).toBeVisible()

  await page.getByRole('link', { name: 'Alice Johnson' }).click()
  await expect(page).toHaveURL(/\/inquiries\/inq-\d+$/)
  await expect(page.getByText('Is the apartment available for a one-year lease starting September 1?')).toBeVisible()
  await expect(page.getByText('Sunny 2-Bedroom Apartment Downtown')).toBeVisible()

  // SPA navigation back to the list keeps the in-memory mock alive.
  await page.getByRole('link', { name: /back to inquiries/i }).click()
  await expect(page).toHaveURL(/\/inquiries$/)
  await expect(page.getByText('David Miller')).toBeVisible()
})
