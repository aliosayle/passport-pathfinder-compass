const Employee = require('../models/employee');

// Controller for handling employee-related operations
const employeeController = {
  // Get all employees
  getAllEmployees: async (req, res) => {
    try {
      const employees = await Employee.getAll();
      res.status(200).json(employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      res.status(500).json({ message: 'Failed to fetch employees', error: error.message });
    }
  },

  // Get employee by ID
  getEmployeeById: async (req, res) => {
    try {
      const { id } = req.params;
      const employee = await Employee.getById(id);
      
      if (!employee) {
        return res.status(404).json({ message: `Employee with ID ${id} not found` });
      }
      
      res.status(200).json(employee);
    } catch (error) {
      console.error(`Error fetching employee ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to fetch employee', error: error.message });
    }
  },

  // Create new employee
  createEmployee: async (req, res) => {
    try {
      const employeeData = req.body;
      
      // Basic validation
      if (!employeeData.id || !employeeData.name) {
        return res.status(400).json({ message: 'Employee ID and name are required' });
      }
      
      const newEmployee = await Employee.create(employeeData);
      res.status(201).json({ message: 'Employee created successfully', employee: newEmployee });
    } catch (error) {
      console.error('Error creating employee:', error);
      res.status(500).json({ message: 'Failed to create employee', error: error.message });
    }
  },

  // Update employee
  updateEmployee: async (req, res) => {
    try {
      const { id } = req.params;
      const employeeData = req.body;
      
      // Check if employee exists
      const existingEmployee = await Employee.getById(id);
      if (!existingEmployee) {
        return res.status(404).json({ message: `Employee with ID ${id} not found` });
      }
      
      const updated = await Employee.update(id, employeeData);
      
      if (updated) {
        res.status(200).json({ message: 'Employee updated successfully' });
      } else {
        res.status(400).json({ message: 'Failed to update employee' });
      }
    } catch (error) {
      console.error(`Error updating employee ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to update employee', error: error.message });
    }
  },

  // Delete employee
  deleteEmployee: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if employee exists
      const existingEmployee = await Employee.getById(id);
      if (!existingEmployee) {
        return res.status(404).json({ message: `Employee with ID ${id} not found` });
      }
      
      const deleted = await Employee.delete(id);
      
      if (deleted) {
        res.status(200).json({ message: 'Employee deleted successfully' });
      } else {
        res.status(400).json({ message: 'Failed to delete employee' });
      }
    } catch (error) {
      console.error(`Error deleting employee ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to delete employee', error: error.message });
    }
  }
};

module.exports = employeeController;