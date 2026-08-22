import apiClient from './axios';

export const employeeApi = {
  // Employee self-service
  getMyProfile: async () => {
    const response = await apiClient.get('/api/employees/me');
    return response.data;
  },

  updateMyProfile: async (data) => {
    const response = await apiClient.put('/api/employees/me', data);
    return response.data;
  },

  // Admin employee endpoints
  getAllEmployees: async (params = {}) => {
    const response = await apiClient.get('/api/admin/employees', { params });
    return response.data;
  },

  getEmployeeById: async (id) => {
    const response = await apiClient.get(`/api/admin/employees/${id}`);
    return response.data;
  },

  createEmployee: async (data) => {
    const response = await apiClient.post('/api/admin/employees', data);
    return response.data;
  },

  updateEmployee: async (id, data) => {
    const response = await apiClient.put(`/api/admin/employees/${id}`, data);
    return response.data;
  },

  updateAccountStatus: async (id, status) => {
    const response = await apiClient.patch(`/api/admin/employees/${id}/status`, null, {
      params: { status },
    });
    return response.data;
  },
};
