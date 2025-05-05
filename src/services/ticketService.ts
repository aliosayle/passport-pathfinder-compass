import apiClient from '@/lib/api-client';

export type TicketStatus = 'Pending' | 'Active' | 'Used' | 'Completed' | 'Cancelled' | 'Delayed' | 'Rescheduled' | 'Expired';
export type TicketType = 'Business' | 'Vacation' | 'Sick Leave' | 'Family Emergency' | 'Training';

export interface Ticket {
  id: string;
  reference: string;
  employee_id: string;
  employee_name: string;
  airline_id: string;
  airline_name: string;
  origin: string;
  destination: string;
  departure_date: string | Date;
  return_date?: string | Date;
  cost?: number;
  currency?: string;
  flight_number?: string;
  status: TicketStatus;
  type: TicketType;
  notes?: string;
  has_return: boolean;
  departure_completed: boolean;
  return_completed: boolean;
  departure_flight_id?: string;
  return_flight_id?: string;
  issue_date?: string | Date;
  last_updated: string | Date;
}

class TicketService {
  async getAll(): Promise<Ticket[]> {
    try {
      const response = await apiClient.get('/tickets');
      return response.data;
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw error;
    }
  }

  async getById(id: string): Promise<Ticket> {
    try {
      const response = await apiClient.get(`/tickets/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ticket ${id}:`, error);
      throw error;
    }
  }

  async getPendingTickets(): Promise<Ticket[]> {
    try {
      const response = await apiClient.get(`/tickets/status?status=Pending`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pending tickets:', error);
      throw error;
    }
  }

  async getActiveTickets(): Promise<Ticket[]> {
    try {
      const response = await apiClient.get(`/tickets/status?status=Active`);
      
      // Filter to only include those with return dates
      return response.data.filter((ticket: Ticket) => 
        ticket.has_return && 
        !ticket.return_completed &&
        ticket.return_date
      );
    } catch (error) {
      console.error('Error fetching active tickets:', error);
      throw error;
    }
  }

  async create(ticket: Partial<Ticket>): Promise<Ticket> {
    try {
      // Generate reference if not provided
      if (!ticket.reference) {
        ticket.reference = this.generateTicketReference();
      }
      
      const response = await apiClient.post('/tickets', ticket);
      return response.data;
    } catch (error) {
      console.error('Error creating ticket:', error);
      throw error;
    }
  }

  async update(id: string, ticket: Partial<Ticket>): Promise<Ticket> {
    try {
      const response = await apiClient.put(`/tickets/${id}`, ticket);
      return response.data;
    } catch (error) {
      console.error(`Error updating ticket ${id}:`, error);
      throw error;
    }
  }

  async updateStatus(id: string, status: TicketStatus, notes?: string): Promise<Ticket> {
    try {
      const response = await apiClient.put(`/tickets/${id}/status`, { status, notes });
      return response.data;
    } catch (error) {
      console.error(`Error updating ticket status ${id}:`, error);
      throw error;
    }
  }

  async createFlightFromTicket(id: string, isReturn: boolean = false): Promise<any> {
    try {
      const response = await apiClient.post(`/tickets/${id}/create-flight`, { isReturn });
      return response.data;
    } catch (error) {
      console.error(`Error creating flight from ticket ${id}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/tickets/${id}`);
    } catch (error) {
      console.error(`Error deleting ticket ${id}:`, error);
      throw error;
    }
  }

  generateTicketReference(): string {
    const prefix = 'TKT';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${timestamp}${random}`;
  }
}

export const ticketService = new TicketService();