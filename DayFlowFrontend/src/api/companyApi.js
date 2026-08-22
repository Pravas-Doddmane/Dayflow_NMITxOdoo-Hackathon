import apiClient from './axios';

export const companyApi = {
  getCompanyProfile: async () => {
    const response = await apiClient.get('/api/company/profile');
    return response.data;
  },

  updateCompanyProfile: async (data) => {
    const response = await apiClient.put('/api/admin/company/profile', data);
    return response.data;
  },
};
