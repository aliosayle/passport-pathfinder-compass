import apiClient from '../lib/api-client';
import { v4 as uuidv4 } from 'uuid';

interface Airline {
  id: string;
  name: string;
  code: string;
  contact_info?: string;
  contactInfo?: string; // For frontend compatibility
}

// Type for creating or updating an airline
interface AirlinePayload {
  name: string;
  code: string;
  contact_info?: string;
}

/**
 * Generates a shorter ID compatible with the database's VARCHAR(10) constraint
 * Uses first 8 chars of a UUID and adds 'AL' prefix for airlines
 */
const generateShortId = (): string => {
  const uuid = uuidv4();
  return `AL${uuid.split('-')[0].substring(0, 8)}`.substring(0, 10);
};

export const airlineService = {
  // Get all airlines
  getAll: async () => {
    const response = await apiClient.get('/airlines');
    // Transform data for frontend compatibility
    return response.data.map((airline: Airline) => ({
      ...airline,
      contactInfo: airline.contact_info
    }));
  },

  // Get airline by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/airlines/${id}`);
    const airline = response.data;
    return {
      ...airline,
      contactInfo: airline.contact_info
    };
  },

  // Create a new airline
  create: async (payload: AirlinePayload) => {
    // Generate a shorter ID compatible with the database's VARCHAR(10) constraint
    const airlineWithId = {
      id: generateShortId(),
      ...payload
    };
    
    const response = await apiClient.post('/airlines', airlineWithId);
    return {
      ...response.data,
      contactInfo: response.data.contact_info
    };
  },

  // Update an existing airline
  update: async (id: string, payload: AirlinePayload) => {
    const response = await apiClient.put(`/airlines/${id}`, payload);
    return {
      ...response.data,
      contactInfo: response.data.contact_info
    };
  },

  // Delete an airline
  delete: async (id: string) => {
    await apiClient.delete(`/airlines/${id}`);
  }
};

export type { Airline };