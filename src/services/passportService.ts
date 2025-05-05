import apiClient from '../lib/api-client';

interface Passport {
  id: string;
  employee_name: string;
  employee_id: string;
  passport_number: string;
  nationality: string;
  issue_date: string;
  expiry_date: string;
  status: 'With Company' | 'With Employee' | 'With DGM';
  ticket_reference?: string;
  notes?: string;
  last_updated?: string;
}

export const passportService = {
  // Get all passports
  getAll: async () => {
    const response = await apiClient.get('/passports');
    return response.data;
  },

  // Get passport by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/passports/${id}`);
    return response.data;
  },
  
  // Get passports by user ID
  getByUserId: async (userId: string) => {
    const response = await apiClient.get(`/passports/user/${userId}`);
    return response.data;
  },
  
  // Get passports expiring in X days
  getExpiringPassports: async (days: number) => {
    const response = await apiClient.get(`/passports/expiring/${days}`);
    return response.data;
  },

  // Create new passport
  create: async (passportData: Passport) => {
    const response = await apiClient.post('/passports', passportData);
    return response.data;
  },

  // Update passport
  update: async (id: string, passportData: Partial<Passport>) => {
    const response = await apiClient.put(`/passports/${id}`, passportData);
    return response.data;
  },

  // Delete passport
  delete: async (id: string) => {
    const response = await apiClient.delete(`/passports/${id}`);
    return response.data;
  }
};

export type { Passport };