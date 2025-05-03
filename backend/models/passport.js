const { pool } = require('../config/db');

const Passport = {
  // Get all passports
  getAll: async () => {
    try {
      const [rows] = await pool.query('SELECT * FROM passports ORDER BY employee_name');
      return rows;
    } catch (error) {
      throw error;
    }
  },
  
  // Get passport by ID
  getById: async (id) => {
    try {
      const [rows] = await pool.query('SELECT * FROM passports WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  },
  
  // Get passports expiring within X days
  getExpiringPassports: async (days) => {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM passports WHERE expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY) ORDER BY expiry_date',
        [days]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  },
  
  // Create new passport
  create: async (passportData) => {
    try {
      const { id, employee_name, employee_id, passport_number, nationality, issue_date, 
              expiry_date, status, ticket_reference, notes } = passportData;
      
      const [result] = await pool.query(
        `INSERT INTO passports (id, employee_name, employee_id, passport_number, 
          nationality, issue_date, expiry_date, status, ticket_reference, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, employee_name, employee_id, passport_number, nationality, issue_date, 
         expiry_date, status, ticket_reference, notes]
      );
      
      return { id, ...passportData };
    } catch (error) {
      throw error;
    }
  },
  
  // Update passport
  update: async (id, passportData) => {
    try {
      const { employee_name, employee_id, passport_number, nationality, issue_date, 
              expiry_date, status, ticket_reference, notes } = passportData;
      
      const [result] = await pool.query(
        `UPDATE passports SET employee_name = ?, employee_id = ?, passport_number = ?, 
         nationality = ?, issue_date = ?, expiry_date = ?, status = ?, ticket_reference = ?, 
         notes = ? WHERE id = ?`,
        [employee_name, employee_id, passport_number, nationality, issue_date, 
         expiry_date, status, ticket_reference, notes, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },
  
  // Delete passport
  delete: async (id) => {
    try {
      const [result] = await pool.query('DELETE FROM passports WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Passport;