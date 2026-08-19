// Central endpoint constants.
// INTEGRATION: backend endpoint paths PENDING (owner: Mohammad Arsalan).
// These values are contract placeholders — replace values when the backend
// contract lands, never rename the domain interfaces they back.

export const endpoints = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    session: '/auth/session',
    // PENDING: real password-change endpoint (owner: Mohammad Arsalan, dep #1)
    changePassword: '/auth/change-password',
  },
  properties: {
    list: '/properties',
    create: '/properties',
    get: (propertyId) => `/properties/${propertyId}`,
    update: (propertyId) => `/properties/${propertyId}`,
    remove: (propertyId) => `/properties/${propertyId}`,
    review: (propertyId) => `/properties/${propertyId}/review`,
    approve: (propertyId) => `/properties/${propertyId}/approve`,
    publish: (propertyId) => `/properties/${propertyId}/publish`,
  },
  dashboard: {
    summary: '/dashboard/summary',
  },
  inquiries: {
    list: '/inquiries',
    get: (inquiryId) => `/inquiries/${inquiryId}`,
  },
  viewingRequests: {
    list: '/viewing-requests',
    get: (viewingId) => `/viewing-requests/${viewingId}`,
    updateStatus: (viewingId) => `/viewing-requests/${viewingId}/status`,
  },
  users: {
    list: '/users',
    get: (userId) => `/users/${userId}`,
  },
  ai: {
    generatePropertyContent: '/ai/properties/content',
  },
}
