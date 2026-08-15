import {
  mockAdmin,
  mockProperties,
  mockUsers,
  mockViewingRequests,
  mockInquiries,
} from './mockData.js'
import { createProperty, createViewingRequest } from '../models/index.js'
import { ApiError } from '../api/http.js'
import { propertyWorkflow } from '../config/propertyWorkflow.js'
import { viewingRequestWorkflow } from '../config/viewingRequestWorkflow.js'

const LATENCY = 250

const db = {
  admin: { ...mockAdmin },
  properties: mockProperties.map(createProperty),
  users: mockUsers.map((u) => ({ ...u })),
  viewingRequests: mockViewingRequests.map(createViewingRequest),
  inquiries: mockInquiries.map((i) => ({ ...i })),
}

const clone = (value) => (value == null ? value : JSON.parse(JSON.stringify(value)))

function delay() {
  return new Promise((resolve) => setTimeout(resolve, LATENCY))
}

function nextId(idField, prefix, existing) {
  const max = existing.reduce((acc, item) => {
    const n = Number(item[idField]?.replace(`${prefix}-`, '')) || 0
    return Math.max(acc, n)
  }, 0)
  return `${prefix}-${String(max + 1).padStart(3, '0')}`
}

export const mockApi = {
  async login(identifier, password) {
    await delay()
    if (identifier === db.admin.email && password === db.admin.password) {
      return {
        token: 'mock-token-' + Date.now(),
        admin: { id: db.admin.id, name: db.admin.name, email: db.admin.email },
      }
    }
    throw new ApiError('Invalid email/username or password.', 401)
  },

  async logout() {
    await delay()
    return undefined
  },

  async getSession() {
    await delay()
    return null
  },

  async changePassword(currentPassword, newPassword) {
    await delay()
    if (currentPassword !== db.admin.password) {
      throw new ApiError('The current password is incorrect.', 400)
    }
    db.admin.password = newPassword
    return { success: true }
  },

  async listProperties(params = {}) {
    await delay()
    const { search = '', status = 'all', availability = 'all', propertyType = 'all' } = params ?? {}
    let list = clone(db.properties)
    const query = String(search ?? '').trim().toLowerCase()
    if (query) {
      list = list.filter(
        (p) => p.title.toLowerCase().includes(query) || p.location.toLowerCase().includes(query)
      )
    }
    if (status && status !== 'all') {
      list = list.filter((p) => p.status === status)
    }
    if (availability && availability !== 'all') {
      list = list.filter((p) => p.availability === availability)
    }
    if (propertyType && propertyType !== 'all') {
      list = list.filter((p) => p.propertyType === propertyType)
    }
    return list
  },

  async getProperty(propertyId) {
    await delay()
    const property = db.properties.find((p) => p.propertyId === propertyId)
    if (!property) {
      throw new ApiError('Property not found.', 404)
    }
    return clone(property)
  },

  async createProperty(data) {
    await delay()
    const property = createProperty({
      ...data,
      status: data.status || propertyWorkflow.initialStatus,
      propertyId: nextId('propertyId', 'prop', db.properties),
    })
    db.properties.unshift(property)
    return clone(property)
  },

  async updateProperty(propertyId, data) {
    await delay()
    const index = db.properties.findIndex((p) => p.propertyId === propertyId)
    if (index === -1) {
      throw new ApiError('Property not found.', 404)
    }
    const updated = createProperty({ ...db.properties[index], ...data, propertyId })
    db.properties[index] = updated
    return clone(updated)
  },

  async removeProperty(propertyId) {
    await delay()
    const index = db.properties.findIndex((p) => p.propertyId === propertyId)
    if (index === -1) {
      throw new ApiError('Property not found.', 404)
    }
    db.properties.splice(index, 1)
    return undefined
  },

  async reviewProperty(propertyId) {
    await delay()
    return this.applyWorkflowAction(propertyId, 'Review')
  },

  async approveProperty(propertyId) {
    await delay()
    return this.applyWorkflowAction(propertyId, 'Approve')
  },

  async publishProperty(propertyId) {
    await delay()
    return this.applyWorkflowAction(propertyId, 'Publish')
  },

  applyWorkflowAction(propertyId, actionName) {
    const index = db.properties.findIndex((p) => p.propertyId === propertyId)
    if (index === -1) {
      throw new ApiError('Property not found.', 404)
    }
    const property = db.properties[index]
    const action = propertyWorkflow.actions.find((a) => a.action === actionName)
    if (!action) {
      throw new ApiError(`The "${actionName}" action is not supported.`, 400)
    }
    if (!action.allowedFrom.includes(property.status)) {
      throw new ApiError(
        `Cannot ${actionName.toLowerCase()} a property in status "${property.status}".`,
        403
      )
    }
    db.properties[index] = createProperty({ ...property, status: action.resultStatus })
    return clone(db.properties[index])
  },

  async getDashboardSummary() {
    await delay()
    return clone({
      totalProperties: db.properties.length,
      publishedProperties: db.properties.filter((p) => p.status === 'published').length,
      pendingProperties: db.properties.filter((p) => p.status !== 'published').length,
      totalUsers: db.users.length,
      pendingInquiries: db.inquiries.filter((i) => i.status === 'new').length,
      pendingViewingRequests: db.viewingRequests.filter(
        (v) => v.status === 'Pending' || v.status === 'Confirmed'
      ).length,
    })
  },

  async listInquiries() {
    await delay()
    return clone(db.inquiries)
  },

  async getInquiry(inquiryId) {
    await delay()
    const inquiry = db.inquiries.find((i) => i.inquiryId === inquiryId)
    if (!inquiry) {
      throw new ApiError('Inquiry not found.', 404)
    }
    return clone(inquiry)
  },

  async listViewingRequests() {
    await delay()
    return clone(db.viewingRequests)
  },

  async getViewingRequest(viewingId) {
    await delay()
    const request = db.viewingRequests.find((v) => v.viewingId === viewingId)
    if (!request) {
      throw new ApiError('Viewing request not found.', 404)
    }
    return clone(request)
  },

  async updateViewingRequestStatus(viewingId, status) {
    await delay()
    const index = db.viewingRequests.findIndex((v) => v.viewingId === viewingId)
    if (index === -1) {
      throw new ApiError('Viewing request not found.', 404)
    }
    const current = db.viewingRequests[index]
    const transition = viewingRequestWorkflow.actions.find((a) => a.resultStatus === status)
    if (!transition || !transition.allowedFrom.includes(current.status)) {
      throw new ApiError(
        `Cannot change viewing request status to "${status}" from "${current.status}".`,
        403
      )
    }
    db.viewingRequests[index] = createViewingRequest({ ...current, status })
    return clone(db.viewingRequests[index])
  },

  async listUsers(params = {}) {
    await delay()
    const search = String(params.search ?? '').trim().toLowerCase()
    if (!search) {
      return clone(db.users)
    }
    return clone(
      db.users.filter((user) =>
        [user.userId, user.name, user.email, user.phone]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(search))
      )
    )
  },

  async getUser(userId) {
    await delay()
    const user = db.users.find((u) => u.userId === userId)
    if (!user) {
      throw new ApiError('User not found.', 404)
    }
    return clone(user)
  },

  async generatePropertyContent(input) {
    // DEVELOPMENT-ONLY: deterministic mock AI output built from the provided
    // property inputs. Never production data (FR-027). The real AI contract is
    // owned by Sanaullah (dependency #7); this handler only exercises the
    // Admin Panel's service boundary during local development.
    await delay()
    const typeLabel = input.propertyType || 'property'
    const location = input.location || 'a prime location'
    const bedrooms =
      input.bedrooms != null && Number(input.bedrooms) > 0
        ? `${input.bedrooms}-bedroom `
        : ''
    const title = `Modern ${bedrooms}${typeLabel} in ${location}`.trim()
    const description = [
      `This ${typeLabel} in ${location} is available at $${input.price || 'a competitive rate'}.`,
      input.bedrooms != null && Number(input.bedrooms) > 0
        ? `It offers ${input.bedrooms} bedroom(s) and ${input.bathrooms || 1} bathroom(s).`
        : null,
      Array.isArray(input.amenities) && input.amenities.length
        ? `Amenities include: ${input.amenities.join(', ')}.`
        : null,
      input.furnished ? 'The unit comes furnished.' : null,
      input.notes ? `Notes: ${input.notes}` : null,
    ]
      .filter(Boolean)
      .join(' ')
    return { title, description }
  },
}
