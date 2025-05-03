import apiClient from '../lib/api-client';

interface MoneyTransfer {
  id: string;
  employee_id: string;
  employee_name: string;
  amount: number;
  currency: string;
  destination: string;
  beneficiary_name: string;
  beneficiary_phone: string;
  notes?: string;
  status: 'Pending' | 'Completed' | 'Failed';
  date: string;
  last_updated?: string;
}

export const transferService = {
  // Get all transfers
  getAll: async () => {
    const response = await apiClient.get('/transfers');
    return response.data;
  },

  // Get transfer by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/transfers/${id}`);
    return response.data;
  },
  
  // Get transfers by employee ID
  getTransfersByEmployeeId: async (employeeId: string) => {
    const response = await apiClient.get(`/transfers/employee/${employeeId}`);
    return response.data;
  },

  // Create new transfer
  create: async (transferData: MoneyTransfer) => {
    const response = await apiClient.post('/transfers', transferData);
    return response.data;
  },

  // Update transfer status
  updateStatus: async (id: string, status: 'Pending' | 'Completed' | 'Failed') => {
    const response = await apiClient.put(`/transfers/${id}`, { status });
    return response.data;
  },
  
  // Mark transfer as completed
  completeTransfer: async (id: string) => {
    const response = await apiClient.post(`/transfers/${id}/complete`);
    return response.data;
  }
};

export type { MoneyTransfer };