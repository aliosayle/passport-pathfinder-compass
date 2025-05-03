const { pool } = require('../config/db');

const Airline = {
  // Get all airlines
  getAll: async () => {
    try {
      const [rows] = await pool.query('SELECT * FROM airlines ORDER BY name');
      return rows;
    } catch (error) {
      throw error;
    }
  },
  
  // Get airline by ID
  getById: async (id) => {
    try {
      const [rows] = await pool.query('SELECT * FROM airlines WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  },
  
  // Create new airline
  create: async (airlineData) => {
    try {
      const { id, name, code, contact_info } = airlineData;
      
      const [result] = await pool.query(
        'INSERT INTO airlines (id, name, code, contact_info) VALUES (?, ?, ?, ?)',
        [id, name, code, contact_info]
      );
      
      return { id, ...airlineData };
    } catch (error) {
      throw error;
    }
  },
  
  // Update airline
  update: async (id, airlineData) => {
    try {
      const { name, code, contact_info } = airlineData;
      
      const [result] = await pool.query(
        'UPDATE airlines SET name = ?, code = ?, contact_info = ? WHERE id = ?',
        [name, code, contact_info, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },
  
  // Delete airline
  delete: async (id) => {
    try {
      const [result] = await pool.query('DELETE FROM airlines WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Airline;