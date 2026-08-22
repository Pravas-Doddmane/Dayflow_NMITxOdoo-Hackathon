import apiClient from './axios';

export const attendanceApi = {
  // Employee endpoints
  checkIn: async () => {
    const response = await apiClient.post('/api/attendance/check-in');
    return response.data;
  },

  checkOut: async () => {
    const response = await apiClient.post('/api/attendance/check-out');
    return response.data;
  },

  getMyAttendance: async (params = {}) => {
    const response = await apiClient.get('/api/attendance/me', { params });
    return response.data;
  },

  // Admin endpoints
  getAllAttendance: async (params = {}) => {
    const response = await apiClient.get('/api/admin/attendance', { params });
    return response.data;
  },

  getEmployeeAttendance: async (employeeId, params = {}) => {
    const response = await apiClient.get(`/api/admin/attendance/employee/${employeeId}`, { params });
    return response.data;
  },
};
