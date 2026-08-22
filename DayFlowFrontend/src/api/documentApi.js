import apiClient from './axios';

export const documentApi = {
  // Employee endpoint
  getMyDocuments: async () => {
    const response = await apiClient.get('/api/documents/me');
    return response.data;
  },

  // Admin endpoints
  getEmployeeDocuments: async (employeeId) => {
    const response = await apiClient.get(`/api/admin/documents/employee/${employeeId}`);
    return response.data;
  },

  uploadDocument: async (employeeId, documentType, file) => {
    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('file', file);

    const response = await apiClient.post(
      `/api/admin/documents/employee/${employeeId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  deleteDocument: async (documentId) => {
    const response = await apiClient.delete(`/api/admin/documents/${documentId}`);
    return response.data;
  },

  downloadDocument: async (documentId, fileName = 'document.pdf') => {
    const response = await apiClient.get(`/api/documents/${documentId}/download`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
