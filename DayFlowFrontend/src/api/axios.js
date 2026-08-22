import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token if stored in localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dayflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 Unauthorized globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired or invalid, and not on auth endpoints
      const isAuthEndpoint = error.config.url.includes('/api/auth/');
      if (!isAuthEndpoint) {
        localStorage.removeItem('dayflow_token');
        localStorage.removeItem('dayflow_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?session_expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
export { BASE_URL };
