import { env } from '../config/env.js'
import { endpoints } from '../api/endpoints.js'
import http from '../api/http.js'
import { mockApi } from '../mocks/mockApi.js'

const realService = {
  list: (params) => http.get(endpoints.properties.list, { params }),
  get: (propertyId) => http.get(endpoints.properties.get(propertyId)),
  create: (data) => http.post(endpoints.properties.create, data),
  update: (propertyId, data) => http.put(endpoints.properties.update(propertyId), data),
  remove: (propertyId) => http.delete(endpoints.properties.remove(propertyId)),
  // INTEGRATION: approve/publish endpoints PENDING (owner: Mohammad Arsalan,
  // dependency #2). Values are placeholders; domain interfaces stay stable.
  review: (propertyId) => http.post(endpoints.properties.review(propertyId)),
  approve: (propertyId) => http.post(endpoints.properties.approve(propertyId)),
  publish: (propertyId) => http.post(endpoints.properties.publish(propertyId)),
}

const propertyService = env.useMocks
  ? {
      list: (params) => mockApi.listProperties(params),
      get: (propertyId) => mockApi.getProperty(propertyId),
      create: (data) => mockApi.createProperty(data),
      update: (propertyId, data) => mockApi.updateProperty(propertyId, data),
      remove: (propertyId) => mockApi.removeProperty(propertyId),
      review: (propertyId) => mockApi.reviewProperty(propertyId),
      approve: (propertyId) => mockApi.approveProperty(propertyId),
      publish: (propertyId) => mockApi.publishProperty(propertyId),
    }
  : realService

export default propertyService
