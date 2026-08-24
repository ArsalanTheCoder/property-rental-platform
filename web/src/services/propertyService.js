import apiClient from './api';



export const propertyService = {
  async getProperties(params = {}) {
    try {
      // Clean undefined params and enforce limit <= 50
      const queryParams = { ...params };
      if (queryParams.limit) {
        queryParams.limit = Math.min(Number(queryParams.limit), 50);
      }
      
      const response = await apiClient.get('/properties', { params: queryParams });
      const payload = response.data?.data || response.data;
      
      return {
        success: true,
        count: payload?.count || payload?.properties?.length || 0,
        properties: payload?.properties || payload || [],
        pagination: payload?.pagination || null
      };
    } catch (error) {
      throw {
        message: error.message || 'Failed to fetch properties',
        status: error.status || 500
      };
    }
  },

  async getFeaturedProperties() {
    try {
      const response = await apiClient.get('/properties/featured');
      const payload = response.data?.data || response.data;
      return {
        success: true,
        properties: payload?.properties || payload || []
      };
    } catch (error) {
      throw {
        message: error.message || 'Failed to fetch featured properties',
        status: error.status || 500
      };
    }
  },

  async getPropertyById(id) {
    try {
      const response = await apiClient.get(`/properties/${id}`);
      const payload = response.data?.data || response.data;
      return {
        success: true,
        property: payload?.property || payload,
        isFavorited: payload?.isFavorited || false
      };
    } catch (error) {
      throw {
        message: error.message || 'Failed to fetch property details',
        status: error.status || 500
      };
    }
  }
};
