import apiClient from './api';

export const authService = {
  // Login user (POST /api/v1/auth/login)
  async login(email, password) {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password
      });

      const payload = response.data?.data || response.data;

      if (payload?.user) {
        localStorage.setItem('haven_user', JSON.stringify(payload.user));
      }

      return {
        success: true,
        user: payload?.user,
        message: response.data?.message || 'Login successful'
      };
    } catch (error) {
      throw {
        message: error.message || 'Invalid email or password',
        status: error.status || 401
      };
    }
  },

  // Signup user (POST /api/v1/auth/register)
  async signup(name, email, password) {
    try {
      // Backend requires confirmPassword
      const response = await apiClient.post('/auth/register', {
        name,
        email,
        password,
        confirmPassword: password
      });

      const payload = response.data?.data || response.data;

      return {
        success: true,
        user: payload?.user,
        message:
          response.data?.message ||
          'Account created successfully. Check your email to verify.'
      };
    } catch (error) {
      throw {
        message:
          error.message ||
          'Registration failed. Please check input details.',
        status: error.status || 400
      };
    }
  },

  // Get current authenticated user session (GET /api/v1/auth/me)
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/auth/me');

      const payload = response.data?.data || response.data;
      const user = payload?.user || payload;

      if (user && (user.email || user._id || user.id)) {
        localStorage.setItem('haven_user', JSON.stringify(user));
        return { success: true, user };
      }

      return { success: false, user: null };
    } catch (error) {
      localStorage.removeItem('haven_user');
      return { success: false, user: null };
    }
  },

  // Logout (POST /api/v1/auth/logout)
  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('haven_user');
    }
  }
};