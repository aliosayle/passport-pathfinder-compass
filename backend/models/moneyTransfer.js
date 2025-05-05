// filepath: c:\Users\User\projects\passport-pathfinder-compass\backend\models\moneyTransfer.js
const { pool } = require('../config/db');

// Helper function to format dates for MySQL
const formatDateForMySQL = (date) => {
  if (!date) return null;
  
  // Handle Date objects
  if (date instanceof Date) {
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }
  
  // Handle ISO string dates
  if (typeof date === 'string' && date.includes('T')) {
    return date.slice(0, 19).replace('T', ' ');
  }
  
  return date;
};

// MoneyTransfer model functions
const MoneyTransfer = {
  // Create a new money transfer
  create: async (transferData) => {
    // Create a copy to avoid modifying the original object
    const formattedData = { ...transferData };
    
    // Format dates before inserting
    if (formattedData.date) {
      formattedData.date = formatDateForMySQL(formattedData.date);
    }
    if (formattedData.last_updated) {
      formattedData.last_updated = formatDateForMySQL(formattedData.last_updated);
    }

    const [result] = await pool.query(
      'INSERT INTO money_transfers SET ?',
      formattedData
    );
    return result.insertId;
  },

  // Get all money transfers
  findAll: async () => {
    const [rows] = await pool.query('SELECT * FROM money_transfers ORDER BY date DESC');
    return rows;
  },

  // Get money transfer by id
  findById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM money_transfers WHERE id = ?', [id]);
    return rows[0];
  },

  // Get money transfers by employee id
  findByEmployeeId: async (employeeId) => {
    const [rows] = await pool.query('SELECT * FROM money_transfers WHERE employee_id = ? ORDER BY date DESC', [employeeId]);
    return rows;
  },

  // Update a money transfer
  update: async (id, transferData) => {
    // Create a copy to avoid modifying the original object
    const formattedData = { ...transferData };
    
    // Format dates before updating
    formattedData.last_updated = new Date();
    if (formattedData.date) {
      formattedData.date = formatDateForMySQL(formattedData.date);
    }
    formattedData.last_updated = formatDateForMySQL(formattedData.last_updated);
    
    const [result] = await pool.query(
      'UPDATE money_transfers SET ? WHERE id = ?',
      [formattedData, id]
    );
    return result.affectedRows;
  },

  // Delete a money transfer
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM money_transfers WHERE id = ?', [id]);
    return result.affectedRows;
  },
};

module.exports = MoneyTransfer;