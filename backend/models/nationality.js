const { pool } = require('../config/db');

const Nationality = {
  // Get all nationalities
  getAll: async () => {
    try {
      const [rows] = await pool.query('SELECT * FROM nationalities ORDER BY name');
      return rows;
    } catch (error) {
      throw error;
    }
  },
  
  // Get nationality by ID
  getById: async (id) => {
    try {
      const [rows] = await pool.query('SELECT * FROM nationalities WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  },
  
  // Create new nationality
  create: async (nationalityData) => {
    try {
      const { id, name, code, visa_requirements } = nationalityData;
      
      const [result] = await pool.query(
        'INSERT INTO nationalities (id, name, code, visa_requirements) VALUES (?, ?, ?, ?)',
        [id, name, code, visa_requirements]
      );
      
      return { id, ...nationalityData };
    } catch (error) {
      throw error;
    }
  },
  
  // Update nationality
  update: async (id, nationalityData) => {
    try {
      const { name, code, visa_requirements } = nationalityData;
      
      const [result] = await pool.query(
        'UPDATE nationalities SET name = ?, code = ?, visa_requirements = ? WHERE id = ?',
        [name, code, visa_requirements, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },
  
  // Delete nationality
  delete: async (id) => {
    try {
      const [result] = await pool.query('DELETE FROM nationalities WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = Nationality;