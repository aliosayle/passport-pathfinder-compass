import apiClient from '../lib/api-client';
import { v4 as uuidv4 } from 'uuid';

interface Flight {
  id: string;
  employee_name: string;
  employee_id: string;
  departure_date: string;
  return_date?: string;
  destination: string;
  origin: string;
  airline_id: string;
  airline_name: string;
  ticket_reference: string;
  flight_number?: string;
  status: 'Pending' | 'Completed' | 'Cancelled' | 'Delayed';
  type: 'Business' | 'Vacation' | 'Sick Leave' | 'Family Emergency' | 'Training';
  notes?: string;
  last_updated?: string;
}

/**
 * Generates a shorter ID compatible with the database's VARCHAR constraints
 * Uses first part of a UUID and adds 'FL' prefix for flights
 */
const generateFlightId = (): string => {
  const uuid = uuidv4();
  return `FL${uuid.split('-')[0].substring(0, 8)}`.substring(0, 20);
};

export const flightService = {
  // Get all flights
  getAll: async () => {
    const response = await apiClient.get('/flights');
    return response.data;
  },

  // Get flight by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/flights/${id}`);
    return response.data;
  },
  
  // Get flights for employee
  getFlightsByEmployeeId: async (employeeId: string) => {
    const response = await apiClient.get(`/flights/employee/${employeeId}`);
    return response.data;
  },
  
  // Get flights by user ID
  getByUserId: async (userId: string) => {
    const response = await apiClient.get(`/flights/user/${userId}`);
    return response.data;
  },

  // Create new flight
  create: async (flightData: Omit<Flight, 'id'>) => {
    // Generate a proper flight ID compatible with database constraints
    const flightWithId = {
      ...flightData,
      id: generateFlightId()
    };
    
    // Standardize date formats for backend
    if (flightWithId.departure_date) {
      flightWithId.departure_date = new Date(flightWithId.departure_date).toISOString();
    }
    
    if (flightWithId.return_date) {
      flightWithId.return_date = new Date(flightWithId.return_date).toISOString();
    }
    
    try {
      const response = await apiClient.post('/flights', flightWithId);
      return response.data;
    } catch (error) {
      console.error('Error creating flight:', error);
      throw error;
    }
  },

  // Update flight
  update: async (id: string, flightData: Partial<Flight>) => {
    const response = await apiClient.put(`/flights/${id}`, flightData);
    return response.data;
  },

  // Delete flight
  delete: async (id: string) => {
    const response = await apiClient.delete(`/flights/${id}`);
    return response.data;
  }
};

export type { Flight };