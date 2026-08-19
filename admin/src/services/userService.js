import { env } from '../config/env.js'
import { endpoints } from '../api/endpoints.js'
import http from '../api/http.js'
import { mockApi } from '../mocks/mockApi.js'

// INTEGRATION: backend user endpoints PENDING (owner: Mohammad Arsalan,
// dependency #2). Read-mostly: no user mutation actions are invented here.
const realService = {
  list: (params) => http.get(endpoints.users.list, { params }),
  get: (userId) => http.get(endpoints.users.get(userId)),
}

const userService = env.useMocks
  ? {
      list: (params) => mockApi.listUsers(params),
      get: (userId) => mockApi.getUser(userId),
    }
  : realService

export default userService
