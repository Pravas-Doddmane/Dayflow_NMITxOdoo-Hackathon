import apiClient from './axios';

export const leaveApi = {
  // Employee endpoints
  applyLeave: async (data) => {
    const response = await apiClient.post('/api/leaves', data);
    return response.data;
  },

  applyForLeave: async (data) => {
    const response = await apiClient.post('/api/leaves', data);
    return response.data;
  },

  getMyLeaves: async () => {
    const response = await apiClient.get('/api/leaves/me');
    return response.data;
  },

  // Admin endpoints
  getAllLeaves: async (params = {}) => {
    const response = await apiClient.get('/api/admin/leaves', { params });
    return response.data;
  },

  approveLeave: async (id, reviewData = {}) => {
    const response = await apiClient.put(`/api/admin/leaves/${id}/approve`, reviewData);
    return response.data;
  },

  rejectLeave: async (id, reviewData = {}) => {
    const response = await apiClient.put(`/api/admin/leaves/${id}/reject`, reviewData);
    return response.data;
  },
};
