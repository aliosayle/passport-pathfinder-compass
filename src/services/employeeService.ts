import apiClient from '../lib/api-client';

interface Employee {
  id: string;
  name: string;
  department?: string;
  position?: string;
  email?: string;
  phone?: string;
  nationality?: string;
  passport_id?: string;
  join_date?: string;
  notes?: string;
}

export const employeeService = {
  // Get all employees
  getAll: async () => {
    const response = await apiClient.get('/employees');
    return response.data;
  },

  // Get employee by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/employees/${id}`);
    return response.data;
  },

  // Create new employee
  create: async (employeeData: Employee) => {
    const response = await apiClient.post('/employees', employeeData);
    return response.data;
  },

  // Update employee
  update: async (id: string, employeeData: Partial<Employee>) => {
    const response = await apiClient.put(`/employees/${id}`, employeeData);
    return response.data;
  },

  // Delete employee
  delete: async (id: string) => {
    const response = await apiClient.delete(`/employees/${id}`);
    return response.data;
  }
};

export type { Employee };