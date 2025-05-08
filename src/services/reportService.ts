import { api } from '../lib/api-client';

interface ReportRequest {
  employeeId: string;
  startDate: string;
  endDate: string;
  format?: 'pdf' | 'json';
}

interface ReportResponse {
  message: string;
  report: EmployeeReport;
}

export interface EmployeeReport {
  reportPeriod: {
    startDate: string;
    endDate: string;
  };
  employee: {
    id: string;
    name: string;
    department: string;
    position: string;
    email: string;
    phone: string;
    nationality: string;
    passport_id: string;
    join_date: string;
    notes: string;
  };
  passport: {
    id: string;
    employee_name: string;
    employee_id: string;
    passport_number: string;
    nationality: string;
    issue_date: string;
    expiry_date: string;
    status: string;
    ticket_reference: string;
    notes: string;
    last_updated: string;
  } | null;
  flights: Array<{
    id: string;
    ticket_id: string;
    employee_name: string;
    employee_id: string;
    departure_date: string;
    return_date: string;
    destination: string;
    origin: string;
    airline_id: string;
    airline_name: string;
    ticket_reference: string;
    flight_number: string;
    is_return: number;
    status: string;
    type: string;
    notes: string;
    last_updated: string;
    booking_reference: string;
  }>;
  tickets: Array<{
    id: string;
    reference: string;
    employee_name: string;
    employee_id: string;
    issue_date: string;
    airline_id: string;
    airline_name: string;
    flight_number: string;
    departure_date: string;
    return_date: string;
    destination: string;
    origin: string;
    cost: number;
    currency: string;
    status: string;
    type: string;
    has_return: number;
    departure_completed: number;
    return_completed: number;
    notes: string;
    last_updated: string;
    departure_flight_id: string;
    return_flight_id: string;
  }>;
  transfers: Array<{
    id: string;
    employee_id: string;
    employee_name: string;
    amount: number;
    currency: string;
    destination: string;
    beneficiary_name: string;
    beneficiary_phone: string;
    notes: string;
    status: string;
    date: string;
    last_updated: string;
  }>;
  visaDestinations: Array<{
    destination: string;
    type: string;
  }>;
  generatedAt: string;
  summary: {
    totalFlights: number;
    totalTransfers: number;
    totalTransferAmount: number;
    currencies: string[];
    destinations: string[];
    period: {
      startDate: string;
      endDate: string;
    };
  };
}

export const reportService = {
  generateEmployeeReport: async (data: ReportRequest): Promise<EmployeeReport> => {
    const response = await api.post<ReportResponse>('/reports/employee', data);
    return response.data.report;
  },

  downloadEmployeeReport: async (data: ReportRequest): Promise<void> => {
    try {
      // Set default format to PDF if not specified
      const requestData = { ...data, format: data.format || 'pdf' };
      
      // Get the current token
      const token = localStorage.getItem('passport_pathfinder_token');
      
      // Create a direct download link instead of processing the response
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const endpoint = '/api/reports/employee/download';
      const queryParams = new URLSearchParams({
        employeeId: data.employeeId,
        startDate: data.startDate,
        endDate: data.endDate,
        format: requestData.format,
        token: token || '' // Pass token as query param for direct downloads
      }).toString();
      
      // Open the download in a new window/tab
      window.open(`${baseUrl}${endpoint}?${queryParams}`, '_blank');
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error downloading report:', error);
      throw error;
    }
  },

  generateTransfersReport: async (data: { startDate: string; endDate: string }): Promise<any> => {
    const response = await api.post('/reports/transfers', data);
    return response.data.report;
  },

  downloadTransfersReport: async (data: { startDate: string; endDate: string; format?: 'excel' | 'json' }): Promise<void> => {
    try {
      const requestData = { ...data, format: data.format || 'excel' };
      const token = localStorage.getItem('passport_pathfinder_token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const endpoint = '/api/reports/transfers/download';
      const queryParams = new URLSearchParams({
        startDate: requestData.startDate,
        endDate: requestData.endDate,
        format: requestData.format,
        token: token || ''
      }).toString();
      
      window.open(`${baseUrl}${endpoint}?${queryParams}`, '_blank');
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error downloading transfers report:', error);
      throw error;
    }
  }
};