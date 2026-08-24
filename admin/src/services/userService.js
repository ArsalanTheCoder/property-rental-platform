import { env } from '../config/env.js'
import { endpoints } from '../api/endpoints.js'
import http from '../api/http.js'
import { mockApi } from '../mocks/mockApi.js'

// Read-mostly domain plus the moderation boundary (PATCH /admin/users/:id/status
// with { isBlocked?, isActive? }). No other mutation actions are invented here.
//
// Normalization: backend User documents (backend/src/models/User.js) expose
// isEmailVerified/isActive/isBlocked and no phone/favorites fields; the UI
// renders `userId`, `phone`, `favorites`, and an
// 'authentication information'.verified flag.

function unwrap(envelope) {
  return envelope && typeof envelope === 'object' && 'data' in envelope ? envelope.data : envelope
}

function normalizeUser(raw) {
  if (!raw || typeof raw !== 'object') {
    return raw
  }
  return {
    userId: raw._id ?? raw.id ?? raw.userId ?? '',
    name: raw.name ?? '',
    email: raw.email ?? '',
    phone: raw.phone ?? '',
    role: raw.role,
    'authentication information': {
      method: 'email',
      verified: Boolean(raw.isEmailVerified),
    },
    isActive: raw.isActive,
    isBlocked: raw.isBlocked,
    // Not exposed by GET /admin/users(/:id) yet — rendered as empty by the UI.
    favorites: [],
  }
}

const realService = {
  list: async (params) => {
    const query = {}
    if (params?.search) query.search = params.search
    if (params?.isBlocked !== undefined) query.isBlocked = params.isBlocked
    if (params?.isEmailVerified !== undefined) query.isEmailVerified = params.isEmailVerified
    const data = unwrap(await http.get(endpoints.users.list, { params: query }))
    return (data?.users ?? []).map(normalizeUser)
  },

  get: async (userId) => {
    const data = unwrap(await http.get(endpoints.users.get(userId)))
    const user = normalizeUser(data?.user)
    if (user && typeof user === 'object') {
      user.metrics = { totalViewings: data?.metrics?.totalViewings ?? 0 }
    }
    return user
  },

  updateStatus: async (userId, data) => {
    const body = {}
    if (typeof data === 'boolean') {
      // Convenience overload: updateStatus(id, blocked)
      body.isBlocked = data
    } else if (data && typeof data === 'object') {
      if (data.isBlocked !== undefined) body.isBlocked = Boolean(data.isBlocked)
      if (data.isActive !== undefined) body.isActive = Boolean(data.isActive)
    }
    const result = unwrap(
      await http.patch(endpoints.users.updateStatus(userId), body)
    )
    return result ?? { userId, ...body }
  },
}

const userService = env.useMocks
  ? {
      list: (params) => mockApi.listUsers(params),
      get: (userId) => mockApi.getUser(userId),
      updateStatus: (userId, data) => mockApi.updateUserStatus(userId, data),
    }
  : realService

export default userService
