import { describe, it, expect, beforeAll } from 'vitest'
import authService from '../../src/services/authService.js'
import propertyService from '../../src/services/propertyService.js'
import dashboardService from '../../src/services/dashboardService.js'
import viewingRequestService from '../../src/services/viewingRequestService.js'
import userService from '../../src/services/userService.js'
import inquiryService from '../../src/services/inquiryService.js'
import aiService from '../../src/services/aiService.js'

// These tests exercise the real service boundary against the in-memory mock
// (VITE_USE_MOCKS defaults to true), validating that each domain service
// behaves per the contract without inventing endpoints or fabricating success.

describe('authService (mock)', () => {
  it('logs in with the mock admin credentials', async () => {
    const result = await authService.login('admin@rental.com', 'admin123')
    expect(result.admin.email).toBe('admin@rental.com')
    expect(result.token).toBeTruthy()
  })

  it('rejects invalid credentials', async () => {
    await expect(authService.login('admin@rental.com', 'wrong')).rejects.toThrow(
      'Invalid email/username or password.'
    )
  })
})

describe('propertyService (mock)', () => {
  it('lists properties and applies search + filters', async () => {
    const all = await propertyService.list()
    expect(all.length).toBeGreaterThanOrEqual(3)

    const bySearch = await propertyService.list({ search: 'Sunny' })
    expect(bySearch).toHaveLength(1)
    expect(bySearch[0].title).toContain('Sunny')

    const published = await propertyService.list({ status: 'published' })
    expect(published.every((p) => p.status === 'published')).toBe(true)
  })

  it('creates a property with the configured initial status', async () => {
    const created = await propertyService.create({
      title: 'Fresh Listing',
      description: 'A newly created listing with a full description for the mock contract.',
      propertyType: 'Apartment',
      price: 1000,
      location: 'Test Street 1',
      bedrooms: 1,
      bathrooms: 1,
      availability: 'available',
    })
    expect(created.propertyId).toBeTruthy()
    expect(created.status).toBe('draft')

    const loaded = await propertyService.get(created.propertyId)
    expect(loaded.title).toBe('Fresh Listing')
  })

  it('walks the status workflow and rejects a forbidden transition', async () => {
    const created = await propertyService.create({
      title: 'Workflow Listing',
      description: 'A listing used to verify workflow transitions against the mock.',
      propertyType: 'House',
      price: 2000,
      location: 'Workflow Street',
      bedrooms: 3,
      bathrooms: 2,
      availability: 'available',
    })

    await propertyService.updateStatus(created.propertyId, 'published')
    expect((await propertyService.get(created.propertyId)).status).toBe('published')

    await propertyService.updateStatus(created.propertyId, 'unpublished')
    expect((await propertyService.get(created.propertyId)).status).toBe('unpublished')

    // Publishing again is allowed by the config; an unsupported transition
    // target is rejected with 403 without fabricating success.
    await expect(propertyService.updateStatus(created.propertyId, 'confirmed')).rejects.toThrow(
      /Cannot change property status/
    )
  })

  it('updates and removes a property', async () => {
    const created = await propertyService.create({
      title: 'Crud Listing',
      description: 'A listing used to verify update and remove against the mock.',
      propertyType: 'Studio',
      price: 800,
      location: 'Crud Street',
      bedrooms: 0,
      bathrooms: 1,
      availability: 'available',
    })

    const updated = await propertyService.update(created.propertyId, { title: 'Crud Listing 2' })
    expect(updated.title).toBe('Crud Listing 2')

    await propertyService.remove(created.propertyId)
    await expect(propertyService.get(created.propertyId)).rejects.toThrow('Property not found.')
  })
})

describe('dashboardService (mock)', () => {
  it('returns a summary derived from the mock data', async () => {
    const summary = await dashboardService.getSummary()
    expect(summary.totalProperties).toBeGreaterThanOrEqual(3)
    expect(summary.publishedProperties).toBeGreaterThanOrEqual(1)
    expect(summary.totalUsers).toBe(3)
    expect(summary.pendingInquiries).toBeGreaterThanOrEqual(1)
    expect(summary.pendingViewingRequests).toBeGreaterThanOrEqual(1)
  })
})

describe('viewingRequestService (mock)', () => {
  it('lists and gets viewing requests', async () => {
    const all = await viewingRequestService.list()
    expect(all.length).toBeGreaterThanOrEqual(3)
    const one = await viewingRequestService.get(all[0].viewingId)
    expect(one.viewingId).toBe(all[0].viewingId)
  })

  it('updates a status and rejects a forbidden transition', async () => {
    const updated = await viewingRequestService.updateStatus('view-001', 'confirmed')
    expect(updated.status).toBe('confirmed')

    // Rejecting a confirmed request is not allowed by the config → 403.
    await expect(viewingRequestService.updateStatus('view-001', 'rejected')).rejects.toThrow(
      /Cannot change viewing request status/
    )
  })

  it('returns a lead score for a viewing request', async () => {
    const result = await viewingRequestService.getLeadScore('view-002')
    expect(result.viewingId).toBe('view-002')
    expect(result.leadScore.score).toBeGreaterThanOrEqual(0)
    expect(result.leadScore.score).toBeLessThanOrEqual(100)
    expect(typeof result.leadScore.reasoning).toBe('string')
  })
})

describe('userService (mock)', () => {
  it('lists users with search', async () => {
    const all = await userService.list()
    expect(all).toHaveLength(3)

    const filtered = await userService.list({ search: 'alice' })
    expect(filtered).toHaveLength(1)
    expect(filtered[0].name).toBe('Alice Johnson')
  })

  it('gets a user by id', async () => {
    const user = await userService.get('user-001')
    expect(user.userId).toBe('user-001')
    expect(user['authentication information'].verified).toBe(true)
    expect(user.favorites).toContain('prop-001')
  })

  it('updates the moderation status of a user', async () => {
    const updated = await userService.updateStatus('user-002', { isBlocked: true })
    expect(updated.isBlocked).toBe(true)

    // Restore so other tests are unaffected.
    await userService.updateStatus('user-002', { isBlocked: false })
  })
})

describe('inquiryService (mock)', () => {
  it('lists and gets inquiries', async () => {
    const all = await inquiryService.list()
    expect(all.length).toBeGreaterThanOrEqual(2)
    const one = await inquiryService.get('inq-001')
    expect(one.tenant.name).toBe('Alice Johnson')
  })
})

describe('aiService (mock)', () => {
  it('returns development-only generated content from the service boundary', async () => {
    const result = await aiService.generatePropertyContent({
      propertyType: 'apartment',
      location: 'Downtown',
      price: 1500,
    })
    expect(result.title).toBe('Modern apartment in Downtown')
    expect(result.description).toContain('Downtown')
  })
})

describe('authService changePassword (mock)', () => {
  it('rejects a wrong current password and succeeds with the right one', async () => {
    await expect(authService.changePassword('wrong', 'newpass123')).rejects.toThrow(
      'The current password is incorrect.'
    )

    const result = await authService.changePassword('admin123', 'newpass123')
    expect(result.success).toBe(true)

    // Restore the mock password so the remaining test files are unaffected.
    await authService.changePassword('newpass123', 'admin123')
  })
})
