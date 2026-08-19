import { env } from '../config/env.js'
import { endpoints } from '../api/endpoints.js'
import http from '../api/http.js'
import { mockApi } from '../mocks/mockApi.js'

const realService = {
  login: (identifier, password) => http.post(endpoints.auth.login, { identifier, password }),
  logout: () => http.post(endpoints.auth.logout),
  getSession: () => http.get(endpoints.auth.session),
  // PENDING backend auth contract (owner: Mohammad Arsalan): request/response
  // shape and endpoint will follow the backend; the UI only calls this boundary.
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
