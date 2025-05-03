import apiClient from '../lib/api-client';

interface Nationality {
  id: string;
  name: string;
  code: string;
  visa_requirements?: string;
}

export const nationalityService = {
  // Get all nationalities
  getAll: async () => {
    const response = await apiClient.get('/nationalities');
    return response.data;
  },

  // Get nationality by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/nationalities/${id}`);
    return response.data;
  },

  // Create a new nationality
  create: async (nationality: Nationality) => {
    const response = await apiClient.post('/nationalities', nationality);
    return response.data;
  },

  // Update an existing nationality
  update: async (id: string, nationality: Partial<Nationality>) => {
    const response = await apiClient.put(`/nationalities/${id}`, nationality);
    return response.data;
  },

  // Delete a nationality
  delete: async (id: string) => {
    const response = await apiClient.delete(`/nationalities/${id}`);
    return response.data;
  }
};

export type { Nationality };