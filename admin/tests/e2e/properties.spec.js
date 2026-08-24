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

test('an admin can create, view, edit, and delete a property', async ({ page }) => {
  await login(page)

  await page.goto('/properties')
  await expect(page.getByRole('heading', { name: 'Properties' })).toBeVisible()
  await expect(page.getByText('Sunny 2-Bedroom Apartment Downtown')).toBeVisible()

  await page.getByRole('button', { name: 'Add property' }).click()
  await expect(page).toHaveURL(/\/properties\/new/)

  await page.getByLabel(/^Title/).fill('New Modern Loft')
  await page
    .getByLabel(/^Description/)
    .fill('A spacious modern loft with high ceilings, large windows, and a fully equipped kitchen in the arts district.')
  await page.getByLabel(/^Property type/).selectOption('apartment')
  await page.getByLabel(/^Location/).fill('Art District 5')
  await page.getByLabel(/^Price/).fill('1500')
  await page.getByLabel(/^Bedrooms/).fill('2')
  await page.getByLabel(/^Bathrooms/).fill('2')
  await page.getByLabel(/^Amenities/).fill('gym, wifi')
  await page.getByLabel(/^Availability/).selectOption('available')
  await page.getByRole('button', { name: 'Create property' }).click()

  await expect(page).toHaveURL(/\/properties\/prop-\d+$/)
  await expect(page.getByRole('heading', { name: 'New Modern Loft' })).toBeVisible()
  await expect(page.getByText('Art District 5')).toBeVisible()

  // Workflow: Review → Approve → Publish updates the status via the mock.
  await page.getByRole('button', { name: 'Review' }).click()
  await expect(page.getByText('reviewed')).toBeVisible()
  await page.getByRole('button', { name: 'Approve' }).click()
  await expect(page.getByText('approved')).toBeVisible()
  await page.getByRole('button', { name: 'Publish' }).click()
  await expect(page.getByText('published')).toBeVisible()

  // SPA navigation keeps the in-memory mock alive (a full reload would reset it).
  await page.getByRole('link', { name: /back to properties/i }).click()
  await expect(page).toHaveURL(/\/properties$/)
  await expect(page.getByText('New Modern Loft')).toBeVisible()

  await page.getByRole('link', { name: 'New Modern Loft' }).click()
  await expect(page).toHaveURL(/\/properties\/prop-\d+$/)

  await page.getByRole('button', { name: 'Edit' }).click()
  await expect(page).toHaveURL(/\/edit$/)
  await page.getByLabel(/^Title/).fill('New Modern Loft Updated')
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(page).toHaveURL(/\/properties\/prop-\d+$/)
  await expect(page.getByRole('heading', { name: 'New Modern Loft Updated' })).toBeVisible()

  await page.getByRole('link', { name: /back to properties/i }).click()
  await expect(page.getByText('New Modern Loft Updated')).toBeVisible()

  await page.getByRole('link', { name: 'New Modern Loft Updated' }).click()
  await page.getByRole('button', { name: 'Delete' }).click()
  await page
    .getByRole('dialog', { name: 'Delete property' })
    .getByRole('button', { name: 'Delete' })
    .click()

  await expect(page).toHaveURL(/\/properties$/)
  await expect(page.getByText('New Modern Loft Updated')).not.toBeVisible()
})

test('an admin can generate AI content, review, edit, and save it to a property', async ({ page }) => {
  await login(page)

  await page.goto('/properties/prop-001')
  await expect(
    page.getByRole('heading', { name: 'Sunny 2-Bedroom Apartment Downtown' })
  ).toBeVisible()

  await page.getByRole('main').getByRole('button', { name: 'Generate' }).click()

  const generatedTitle = page.getByLabel(/^Generated title/)
  await expect(generatedTitle).toHaveValue(
    'Modern 2-bedroom apartment in Main Street 12, Downtown'
  )
  await expect(page.getByLabel(/^Generated description/)).toHaveValue(
    /This apartment in Main Street 12, Downtown is available at \$1200/
  )

  // Review: the generated draft is editable and only applied on explicit save.
  await generatedTitle.fill('AI-Refreshed Loft')

  await page.getByRole('main').getByRole('button', { name: 'Save to property' }).click()

  await expect(page.getByRole('heading', { name: 'AI-Refreshed Loft' })).toBeVisible()
})

test('an admin can choose local images, preview, remove, and keep them on the created property', async ({
  page,
}) => {
  await login(page)

  await page.goto('/properties/new')
  await expect(page.getByRole('button', { name: 'Choose Images', exact: true })).toBeVisible()
  await expect(
    page.getByText(/local selection is preview\/mock only/i)
  ).toBeVisible()

  // The native picker is not automated; set files directly on the hidden input.
  await page.setInputFiles('input[type="file"]', [
    { name: 'house1.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('fake-jpeg') },
    { name: 'living.png', mimeType: 'image/png', buffer: Buffer.from('fake-png') },
  ])

  await expect(page.getByText('house1.jpg')).toBeVisible()
  await expect(page.getByText('living.png')).toBeVisible()
  await expect(page.getByRole('img', { name: 'house1.jpg' })).toBeVisible()

  // Remove a single selected image; the other preview stays.
  await page.getByRole('button', { name: /remove house1\.jpg/i }).click()
  await expect(page.getByText('house1.jpg')).not.toBeVisible()
  await expect(page.getByText('living.png')).toBeVisible()

  await page.getByLabel(/^Title/).fill('Local Images Loft')
  await page
    .getByLabel(/^Description/)
    .fill('A loft with locally selected photos that stay in the current mock session only.')
  await page.getByLabel(/^Property type/).selectOption('apartment')
  await page.getByLabel(/^Location/).fill('Photo Lane 9')
  await page.getByLabel(/^Price/).fill('1400')
  await page.getByLabel(/^Bedrooms/).fill('1')
  await page.getByLabel(/^Bathrooms/).fill('1')
  await page.getByLabel(/^Availability/).selectOption('available')
  await page.getByRole('button', { name: 'Create property' }).click()

  await expect(page).toHaveURL(/\/properties\/prop-\d+$/)
  await expect(page.getByRole('heading', { name: 'Local Images Loft' })).toBeVisible()
  // The local image survives the mock create flow and renders in the details view.
  await expect(page.getByRole('img', { name: /image 1/i })).toBeVisible()
})

test('invalid property data shows validation errors without submitting', async ({ page }) => {
  await login(page)

  await page.goto('/properties/new')

  await page.getByLabel(/^Title/).fill('AB')
  await page.getByLabel(/^Description/).fill('Too short.')
  await page.getByLabel(/^Price/).fill('-5')
  await page.getByRole('button', { name: 'Create property' }).click()

  await expect(page.getByText('Must be at least 3 characters.')).toBeVisible()
  await expect(page.getByText('Must be at least 20 characters.')).toBeVisible()
  await expect(page.getByText('Enter a valid number (0 or greater).')).toBeVisible()
  await expect(page).toHaveURL(/\/properties\/new/)
})
