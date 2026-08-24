import { env } from '../config/env.js'
import { endpoints } from '../api/endpoints.js'
import http from '../api/http.js'
import { mockApi } from '../mocks/mockApi.js'

const realService = {
  login: async (identifier, password) => {
    const envelope = await http.post(endpoints.auth.login, {
      email: identifier,
      password,
    })
    const user = envelope?.data?.user
    return {
      token: 'session_active',
      admin: user,
    }
  },
  logout: () => http.post(endpoints.auth.logout),
  getSession: async () => {
    const envelope = await http.get(endpoints.auth.session)
    const user = envelope?.data?.user
    return {
      token: 'session_active',
      admin: user,
    }
  },
  changePassword: (currentPassword, newPassword) =>
    http.post(endpoints.auth.changePassword, { currentPassword, newPassword }),
}

const authService = env.useMocks
  ? {
      login: (identifier, password) => mockApi.login(identifier, password),
      logout: () => mockApi.logout(),
      getSession: () => mockApi.getSession(),
      changePassword: (currentPassword, newPassword) =>
        mockApi.changePassword(currentPassword, newPassword),
    }
  : realService

export default authService
