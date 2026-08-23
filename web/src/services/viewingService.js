import apiClient from './api';



export const viewingService = {
  async getMyRequests(params = {}) {
    try {
      const response = await apiClient.get('/viewings/my-requests', { params });
      const payload = response.data?.data || response.data;
      return {
        success: true,
        count: payload?.count || payload?.viewings?.length || 0,
        viewings: payload?.viewings || payload || [],
        pagination: payload?.pagination || null
      };
    } catch (error) {
      throw {
        message: error.message || 'Failed to fetch viewings',
        status: error.status || 500
      };
    }
  },

  async requestViewing(propertyId, { date, time, message }) {
    try {
      const response = await apiClient.post(`/properties/${propertyId}/viewings`, {
        date,
        time,
        message
      });
      const payload = response.data?.data || response.data;
      return {
        success: true,
        viewing: payload?.viewing || payload,
        message: response.data?.message || 'Viewing request submitted successfully.'
      };
    } catch (error) {
      throw {
        message: error.message || 'Failed to request viewing',
        status: error.status || 500
      };
    }
  },

  async cancelViewing(id) {
    try {
      const response = await apiClient.patch(`/viewings/${id}/cancel`);
      const payload = response.data?.data || response.data;
      return {
        success: true,
        viewing: payload?.viewing || payload,
        message: response.data?.message || 'Viewing request cancelled.'
      };
    } catch (error) {
      throw {
        message: error.message || 'Failed to cancel viewing',
        status: error.status || 500
      };
    }
  }
};
