import apiClient from '../lib/api-client';

interface Airline {
  id: string;
  name: string;
  code: string;
  contact_info?: string;
}

export const airlineService = {
  // Get all airlines
  getAll: async () => {
    const response = await apiClient.get('/airlines');
    return response.data;
  },

  // Get airline by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/airlines/${id}`);
    return response.data;
  }
};

export type { Airline };