// Central endpoint constants.
// Mirrors the real backend contract (backend/src/routes/admin.routes.js):
// every admin resource lives under /admin, mounted at `${API_BASE}/v1`.
// Paths without a real backend route are marked explicitly and are never
// called in real-API mode.

export const endpoints = {
  auth: {
    // Real backend routes exist for login/logout/me (backend auth.routes.js),
    // but the full real-mode auth flow (httpOnly-cookie token handoff into
    // sessionStore) is a separate integration dependency. These paths back the
    // mock/dev flow until that contract lands.
    login: '/auth/login',
    logout: '/auth/logout',
    session: '/auth/me',
    // PENDING: the backend has no password-change route yet (mock only).
    changePassword: '/auth/change-password',
  },
  properties: {
    list: '/admin/properties',
    create: '/admin/properties',
    get: (propertyId) => `/admin/properties/${propertyId}`,
    update: (propertyId) => `/admin/properties/${propertyId}`,
    remove: (propertyId) => `/admin/properties/${propertyId}`,
    updateStatus: (propertyId) => `/admin/properties/${propertyId}/status`,
    uploadImages: (propertyId) => `/admin/properties/${propertyId}/images`,
    deleteImage: (propertyId) => `/admin/properties/${propertyId}/images`,
  },
  dashboard: {
    summary: '/admin/dashboard/stats',
  },
  viewingRequests: {
    list: '/admin/viewings',
    get: (viewingId) => `/admin/viewings/${viewingId}`,
    updateStatus: (viewingId) => `/admin/viewings/${viewingId}/status`,
    leadScore: (viewingId) => `/admin/viewings/${viewingId}/lead-score`,
  },
  users: {
    list: '/admin/users',
    get: (userId) => `/admin/users/${userId}`,
    updateStatus: (userId) => `/admin/users/${userId}/status`,
  },
  ai: {
    generateDescription: '/admin/ai/generate-description',
  },
}
