const { pool } = require('../config/db');

const VisaType = {
  // Get all visa types
  getAll: async () => {
    try {
      const [rows] = await pool.query('SELECT * FROM visa_types ORDER BY country_name, type');
      return rows;
    } catch (error) {
      throw error;
    }
  },
  
  // Get visa type by ID
  getById: async (id) => {
    try {
      const [rows] = await pool.query('SELECT * FROM visa_types WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  },
  
  // Create new visa type
  create: async (visaTypeData) => {
    try {
      const { id, type, duration, requirements, country_code, country_name } = visaTypeData;
      
      const [result] = await pool.query(
        'INSERT INTO visa_types (id, type, duration, requirements, country_code, country_name) VALUES (?, ?, ?, ?, ?, ?)',
        [id, type, duration, requirements, country_code, country_name]
      );
      
      return { id, ...visaTypeData };
    } catch (error) {
      throw error;
    }
  },
  
  // Update visa type
  update: async (id, visaTypeData) => {
    try {
      const { type, duration, requirements, country_code, country_name } = visaTypeData;
      
      const [result] = await pool.query(
        'UPDATE visa_types SET type = ?, duration = ?, requirements = ?, country_code = ?, country_name = ? WHERE id = ?',
        [type, duration, requirements, country_code, country_name, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },
  
  // Delete visa type
  delete: async (id) => {
    try {
      const [result] = await pool.query('DELETE FROM visa_types WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = VisaType;