import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 12000,
});

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    const status = error.response?.status || 500;

    let message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected API error occurred';

    if (
      error.message === 'Network Error' ||
      error.code === 'ERR_NETWORK'
    ) {
      message =
        'Network Error: Unable to connect to backend server. Please verify the backend is running.';
    } else if (status === 429) {
      message =
        "You've reached the temporary limit. Please try again later.";
    }

    // Refresh authentication if access token/session expired
    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/refresh-token'
    ) {
      originalRequest._retry = true;

      try {
        await apiClient.post('/auth/refresh-token');

        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('haven_user');
      }
    } else if (status === 401) {
      localStorage.removeItem('haven_user');
    }

    const customError = {
      message,
      status,
      data: error.response?.data?.data || null,
      rawResponse: error.response?.data || null,
    };

    return Promise.reject(customError);
  }
);

export default apiClient;