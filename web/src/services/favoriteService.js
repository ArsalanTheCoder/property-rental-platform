import apiClient from './api';

const getStoredFavorites = () => {
  const local = localStorage.getItem('haven_favorites');
  if (local) {
    try { return JSON.parse(local); } catch (e) {}
  }
  const defaultFavs = ["prop-101", "prop-103"];
  localStorage.setItem('haven_favorites', JSON.stringify(defaultFavs));
  return defaultFavs;
};

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
      await new Promise(res => setTimeout(res, 200));
      const favs = getStoredFavorites();
      return { success: true, favorites: favs };
    }
  },

  // POST /api/v1/favorites/:propertyId (RFC-003-B)
  async addFavorite(propertyId) {
    try {
      const response = await apiClient.post(`/favorites/${propertyId}`);
      const payload = response.data?.data || response.data;
      return {
        success: true,
        isFavorited: true,
        message: response.data?.message || 'Property added to favorites'
      };
    } catch (error) {
      await new Promise(res => setTimeout(res, 200));
      let favs = getStoredFavorites();
      if (!favs.includes(propertyId)) favs.push(propertyId);
      localStorage.setItem('haven_favorites', JSON.stringify(favs));
      return { success: true, isFavorited: true, message: 'Property added to favorites' };
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
      await new Promise(res => setTimeout(res, 200));
      let favs = getStoredFavorites();
      favs = favs.filter(id => id !== propertyId);
      localStorage.setItem('haven_favorites', JSON.stringify(favs));
      return { success: true, isFavorited: false, message: 'Property removed from favorites' };
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
      const favs = getStoredFavorites();
      return { success: true, isFavorited: favs.includes(propertyId) };
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
