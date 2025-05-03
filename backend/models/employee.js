const { pool } = require('../config/db');

const Employee = {
  // Get all employees
  getAll: async () => {
    try {
      const [rows] = await pool.query('SELECT * FROM employees ORDER BY name');
      return rows;
    } catch (error) {
      throw error;
    }
  },
  
  // Get employee by ID
  getById: async (id) => {
    try {
      const [rows] = await pool.query('SELECT * FROM employees WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  },
  
  // Create new employee
  create: async (employeeData) => {
    try {
      const { id, name, department, position, email, phone, nationality, passport_id, join_date, notes } = employeeData;
      
      const [result] = await pool.query(
        'INSERT INTO employees (id, name, department, position, email, phone, nationality, passport_id, join_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, name, department, position, email, phone, nationality, passport_id, join_date, notes]
      );
      
      return { id, ...employeeData };
    } catch (error) {
      throw error;
    }
  },
  
  // Update employee
  update: async (id, employeeData) => {
    try {
      const { name, department, position, email, phone, nationality, passport_id, join_date, notes } = employeeData;
      
      const [result] = await pool.query(
        'UPDATE employees SET name = ?, department = ?, position = ?, email = ?, phone = ?, nationality = ?, passport_id = ?, join_date = ?, notes = ? WHERE id = ?',
        [name, department, position, email, phone, nationality, passport_id, join_date, notes, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },
  
  // Delete employee
  delete: async (id) => {
    try {
      const [result] = await pool.query('DELETE FROM employees WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Employee;