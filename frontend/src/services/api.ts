import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Attach Sanctum Bearer Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('ticketflow_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Uniform error handling & 401 token invalidation
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ticketflow_token');
      localStorage.removeItem('ticketflow_user');
      // If we are in browser and not already on /login, optional redirect
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        // We can trigger an event or handle it gracefully
      }
    }
    
    // Extract server message
    const message =
      error.response?.data?.message ||
      (error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(' ')
        : 'An unexpected server error occurred.');

    return Promise.reject(new Error(message));
  }
);

export default apiClient;
