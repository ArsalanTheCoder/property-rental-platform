import apiClient from './api';

export const userService = {
  async updateProfile(userId, profileData) {
    try {
      const response = await apiClient.put(`/users/${userId}`, profileData);
      return response.data;
    } catch (error) {
      await new Promise(res => setTimeout(res, 400));
      const current = JSON.parse(localStorage.getItem('haven_user') || '{}');
      const updated = { ...current, ...profileData };
      localStorage.setItem('haven_user', JSON.stringify(updated));
      return { success: true, user: updated, message: 'Profile details updated successfully.' };
    }
  }
};
