import apiClient from '../lib/api-client';
import { v4 as uuidv4 } from 'uuid';

export interface VisaType {
  id: string;
  type: string;
  duration: string;
  requirements: string;
  country_code: string;
  country_name: string;
}

// Extended visa interface to include expiry information
export interface Visa extends VisaType {
  employee_id: string;
  employee_name: string;
  issue_date: string;
  expiry_date: string;
  status: string;
}

export const visaTypeService = {
  // Get all visa types
  getAll: async () => {
    const response = await apiClient.get('/visa-types');
    return response.data;
  },

  // Get visa type by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/visa-types/${id}`);
    return response.data;
  },

  // Create new visa type
  create: async (visaTypeData: Omit<VisaType, 'id'>) => {
    const data = {
      ...visaTypeData,
      id: uuidv4() // Generate a UUID for new visa types
    };
    const response = await apiClient.post('/visa-types', data);
    return response.data;
  },

  // Update visa type
  update: async (id: string, visaTypeData: Partial<VisaType>) => {
    const response = await apiClient.put(`/visa-types/${id}`, visaTypeData);
    return response.data;
  },

  // Delete visa type
  delete: async (id: string) => {
    const response = await apiClient.delete(`/visa-types/${id}`);
    return response.data;
  },

  // Get visa information for employees (combines employee and visa data)
  getEmployeeVisas: async () => {
    try {
      // Get all employees with visa information
      const response = await apiClient.get('/employees?include=visa');
      return response.data.filter((emp: any) => emp.visa_expiry_date && emp.visa_type)
        .map((emp: any) => ({
          id: `V${emp.id}`,
          employee_id: emp.id,
          employee_name: emp.name,
          type: emp.visa_type,
          duration: emp.visa_duration || '1 year',
          country_name: emp.nationality,
          country_code: emp.nationality_code || '',
          requirements: emp.visa_requirements || '',
          issue_date: emp.visa_issue_date,
          expiry_date: emp.visa_expiry_date,
          status: emp.visa_status || 'Active'
        }));
    } catch (error) {
      console.error("Error fetching employee visas:", error);
      throw error;
    }
  },
  
  // Get visas expiring within X days
  getExpiringVisas: async (days: number) => {
    try {
      // Try to get from dedicated endpoint if it exists
      try {
        const response = await apiClient.get(`/employees/visas/expiring/${days}`);
        return response.data;
      } catch {
        // Fallback - filter manually from all employee visas
        const visas = await visaTypeService.getEmployeeVisas();
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);
        
        return visas.filter((visa: Visa) => {
          const expiryDate = new Date(visa.expiry_date);
          return expiryDate >= today && expiryDate <= futureDate;
        });
      }
    } catch (error) {
      console.error("Error fetching expiring visas:", error);
      throw error;
    }
  }
};