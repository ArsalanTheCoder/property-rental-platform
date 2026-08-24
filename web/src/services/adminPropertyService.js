import apiClient from './api';

export const adminPropertyService = {
  // GET /api/v1/admin/properties
  async getProperties(params = {}) {
    try {
      const response = await apiClient.get('/admin/properties', {
        params,
      });

      const payload = response.data?.data || response.data;

      return {
        success: true,
        properties: payload?.properties || [],
        pagination: payload?.pagination || null,
        count: payload?.count || 0,
      };
    } catch (error) {
      throw {
        message: error.message || 'Failed to fetch admin properties',
        status: error.status || 500,
        data: error.data || null,
      };
    }
  },

  // POST /api/v1/admin/properties
  async createProperty(propertyData) {
    try {
      const response = await apiClient.post(
        '/admin/properties',
        propertyData
      );

      const payload = response.data?.data || response.data;

      return {
        success: true,
        property: payload?.property || payload,
      };
    } catch (error) {
      throw {
        message: error.message || 'Failed to create property',
        status: error.status || 500,
        data: error.data || null,
      };
    }
  },

  // GET /api/v1/admin/properties/:id
  async getPropertyById(id) {
    try {
      const response = await apiClient.get(`/admin/properties/${id}`);

      const payload = response.data?.data || response.data;

      return {
        success: true,
        property: payload?.property || payload,
      };
    } catch (error) {
      throw {
        message: error.message || 'Failed to fetch property',
        status: error.status || 500,
        data: error.data || null,
      };
    }
  },

  // PATCH /api/v1/admin/properties/:id
  async updateProperty(id, propertyData) {
    try {
      const response = await apiClient.patch(
        `/admin/properties/${id}`,
        propertyData
      );

      const payload = response.data?.data || response.data;

      return {
        success: true,
        property: payload?.property || payload,
      };
    } catch (error) {
      throw {
        message: error.message || 'Failed to update property',
        status: error.status || 500,
        data: error.data || null,
      };
    }
  },

  // PATCH /api/v1/admin/properties/:id/status
  async updatePropertyStatus(id, status) {
    try {
      const response = await apiClient.patch(
        `/admin/properties/${id}/status`,
        { status }
      );

      const payload = response.data?.data || response.data;

      return {
        success: true,
        propertyId: payload?.propertyId,
        status: payload?.status,
      };
    } catch (error) {
      throw {
        message: error.message || 'Failed to update property status',
        status: error.status || 500,
        data: error.data || null,
      };
    }
  },

  // DELETE /api/v1/admin/properties/:id
  async deleteProperty(id) {
    try {
      const response = await apiClient.delete(
        `/admin/properties/${id}`
      );

      return {
        success: true,
        data: response.data?.data || response.data,
      };
    } catch (error) {
      throw {
        message: error.message || 'Failed to delete property',
        status: error.status || 500,
        data: error.data || null,
      };
    }
  },
};