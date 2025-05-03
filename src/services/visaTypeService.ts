import apiClient from '../lib/api-client';

interface VisaType {
  id: string;
  type: string;
  duration: string;
  requirements: string;
  country_code: string;
  country_name: string;
}

export const visaTypeService = {
  // Get all visa types
  getAll: async () => {
    const response = await apiClient.get('/visa-types');
    return response.data;
  },

  // Get visa type by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/visa-types/${id}`);
    return response.data;
  }
};

export type { VisaType };