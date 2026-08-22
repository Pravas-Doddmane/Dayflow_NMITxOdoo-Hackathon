import apiClient from './axios';

export const salaryApi = {
  // Employee endpoint
  getMySalary: async () => {
    const response = await apiClient.get('/api/salary/me');
    return response.data;
  },

  // Admin endpoints
  getEmployeeSalary: async (employeeId) => {
    const response = await apiClient.get(`/api/admin/salary/employee/${employeeId}`);
    return response.data;
  },

  createSalary: async (employeeId, data) => {
    const response = await apiClient.post(`/api/admin/salary/employee/${employeeId}`, data);
    return response.data;
  },

  updateSalary: async (salaryId, data) => {
    const response = await apiClient.put(`/api/admin/salary/${salaryId}`, data);
    return response.data;
  },
};
