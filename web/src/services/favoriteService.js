import apiClient from './api';

export const favoriteService = {
  // GET /api/v1/favorites (RFC-003-B)
  async getFavorites(params = {}) {
    try {
      const response = await apiClient.get('/favorites', { params });
      const payload = response.data?.data || response.data;
      return {
        success: true,
        favorites: payload?.favorites || payload || [],
        pagination: payload?.pagination || null
      };
    } catch (error) {
      return {
        success: false,
        favorites: [],
        message: error.message || 'Failed to fetch favorites'
      };
    }
  },

  // POST /api/v1/favorites/:propertyId (RFC-003-B)
  async addFavorite(propertyId) {
    try {
      const response = await apiClient.post(`/favorites/${propertyId}`);
      return {
        success: true,
        isFavorited: true,
        message: response.data?.message || 'Property added to favorites'
      };
    } catch (error) {
      throw {
        message: error.message || 'Failed to add favorite',
        status: error.status || 500
      };
    }
  },

  // DELETE /api/v1/favorites/:propertyId (RFC-003-B)
  async removeFavorite(propertyId) {
    try {
      const response = await apiClient.delete(`/favorites/${propertyId}`);
      return {
        success: true,
        isFavorited: false,
        message: response.data?.message || 'Property removed from favorites'
      };
    } catch (error) {
      throw {
        message: error.message || 'Failed to remove favorite',
        status: error.status || 500
      };
    }
  },

  // GET /api/v1/favorites/check/:propertyId (RFC-003-B)
  async checkFavorite(propertyId) {
    try {
      const response = await apiClient.get(`/favorites/check/${propertyId}`);
      const payload = response.data?.data || response.data;
      return {
        success: true,
        isFavorited: payload?.isFavorited ?? false
      };
    } catch (error) {
      return { success: false, isFavorited: false };
    }
  },

  // Toggle favorite helper method
  async toggleFavorite(propertyId, isCurrentlyFavorited) {
    if (isCurrentlyFavorited) {
      return this.removeFavorite(propertyId);
    } else {
      return this.addFavorite(propertyId);
    }
  }
};
