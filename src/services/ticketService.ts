import apiClient from '../lib/api-client';

interface Ticket {
  id: string;
  reference: string;
  employee_name: string;
  employee_id: string;
  issue_date: string;
  airline_id: string;
  airline_name: string;
  flight_number?: string;
  departure_date: string;
  return_date?: string;
  destination: string;
  origin: string;
  cost?: number;
  currency?: string;
  status: 'Active' | 'Used' | 'Cancelled' | 'Expired';
  notes?: string;
  last_updated?: string;
}

export const ticketService = {
  // Get all tickets
  getAll: async () => {
    const response = await apiClient.get('/tickets');
    return response.data;
  },

  // Get ticket by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/tickets/${id}`);
    return response.data;
  },
  
  // Get ticket by reference
  getByReference: async (reference: string) => {
    const response = await apiClient.get(`/tickets/reference/${reference}`);
    return response.data;
  },
  
  // Get tickets by employee ID
  getTicketsByEmployeeId: async (employeeId: string) => {
    const response = await apiClient.get(`/tickets/employee/${employeeId}`);
    return response.data;
  },

  // Create new ticket
  create: async (ticketData: Ticket) => {
    const response = await apiClient.post('/tickets', ticketData);
    return response.data;
  },

  // Update ticket
  update: async (id: string, ticketData: Partial<Ticket>) => {
    const response = await apiClient.put(`/tickets/${id}`, ticketData);
    return response.data;
  },

  // Delete ticket
  delete: async (id: string) => {
    const response = await apiClient.delete(`/tickets/${id}`);
    return response.data;
  }
};

export type { Ticket };