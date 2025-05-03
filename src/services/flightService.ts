import apiClient from '../lib/api-client';

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

  // Create new flight
  create: async (flightData: Flight) => {
    const response = await apiClient.post('/flights', flightData);
    return response.data;
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