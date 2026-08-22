import apiClient from './axios';

export const authApi = {
  login: async (credentials) => {
    const response = await apiClient.post('/api/auth/login', credentials);
    return response.data;
  },

  registerAdmin: async (data) => {
    const response = await apiClient.post('/api/auth/register-admin', data);
    return response.data;
  },

  setupPassword: async (data) => {
    const response = await apiClient.post('/api/auth/setup-password', data);
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await apiClient.post(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
    return response.data;
  },

  forgotPassword: async (data) => {
    const response = await apiClient.post('/api/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data) => {
    const response = await apiClient.post('/api/auth/reset-password', data);
    return response.data;
  },
};
