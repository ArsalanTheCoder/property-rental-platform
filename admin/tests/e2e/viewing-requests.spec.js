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

test('an admin can open a viewing request and update its status', async ({ page }) => {
  await login(page)

  await page.goto('/viewing-requests')
  await expect(page.getByRole('heading', { name: 'Viewing Requests' })).toBeVisible()
  await expect(page.getByText('Alice Johnson')).toBeVisible()
  await expect(page.getByText('Bob Williams')).toBeVisible()

  await page.getByRole('link', { name: 'Alice Johnson' }).click()
  await expect(page).toHaveURL(/\/viewing-requests\/view-\d+$/)
  await expect(page.getByText('Interested in a weekend viewing, preferably Saturday morning.')).toBeVisible()

  // Pending → Confirmed via the status actions; the mock persists within the session.
  await page.getByRole('button', { name: 'Confirm' }).click()
  await expect(page.getByText('Confirmed', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Confirm' })).not.toBeVisible()
  await expect(page.getByRole('button', { name: 'Mark completed' })).toBeVisible()

  // SPA navigation back to the list keeps the in-memory mock alive.
  await page.getByRole('link', { name: /back to viewing requests/i }).click()
  await expect(page).toHaveURL(/\/viewing-requests$/)
  await expect(page.getByRole('link', { name: 'Alice Johnson' })).toBeVisible()
})
