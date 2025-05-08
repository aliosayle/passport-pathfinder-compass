import api from '@/lib/api-client';

export interface EmployeeVisa {
  id: string;
  visa_type_id: string;
  employee_id: string;
  employee_name: string;
  issue_date: string;
  expiry_date: string;
  status: 'Valid' | 'Expired' | 'Processing' | 'Cancelled';
  document_number?: string;
  notes?: string;
  
  // Joined fields from visa_types
  type?: string;
  country_name?: string;
  country_code?: string;
  duration?: string;
}

const employeeVisaService = {
  // Get all employee visas
  getAll: async (): Promise<EmployeeVisa[]> => {
    try {
      const response = await api.get('/employee-visas');
      return response.data;
    } catch (error) {
      console.error('Error fetching employee visas:', error);
      throw error;
    }
  },

  // Get employee visa by ID
  getById: async (id: string): Promise<EmployeeVisa> => {
    try {
      const response = await api.get(`/employee-visas/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching employee visa with ID ${id}:`, error);
      throw error;
    }
  },

  // Get visas for a specific employee
  getByEmployeeId: async (employeeId: string): Promise<EmployeeVisa[]> => {
    try {
      const response = await api.get(`/employee-visas/employee/${employeeId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching visas for employee ${employeeId}:`, error);
      throw error;
    }
  },

  // Get visas expiring within X days
  getExpiringVisas: async (days: number = 60): Promise<EmployeeVisa[]> => {
    try {
      const response = await api.get(`/employee-visas/expiring/${days}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching expiring visas:', error);
      throw error;
    }
  },

  // Create new employee visa
  create: async (visaData: Omit<EmployeeVisa, 'id'>): Promise<EmployeeVisa> => {
    try {
      const response = await api.post('/employee-visas', visaData);
      return response.data.visa;
    } catch (error) {
      console.error('Error creating employee visa:', error);
      throw error;
    }
  },

  // Update employee visa
  update: async (id: string, visaData: Partial<EmployeeVisa>): Promise<EmployeeVisa> => {
    try {
      const response = await api.put(`/employee-visas/${id}`, visaData);
      return response.data.visa;
    } catch (error) {
      console.error(`Error updating employee visa with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete employee visa
  delete: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/employee-visas/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting employee visa with ID ${id}:`, error);
      throw error;
    }
  }
};

export default employeeVisaService;