const { pool } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Helper function to format dates for MySQL
const formatDateForMySQL = (date) => {
  if (!date) return null;
  
  if (date instanceof Date) {
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }
  
  if (typeof date === 'string' && date.includes('T')) {
    return date.slice(0, 19).replace('T', ' ');
  }
  
  return date;
};

const Upload = {
  // Create a new file upload record
  create: async (fileData) => {
    // Generate UUID if not provided
    if (!fileData.id) {
      fileData.id = uuidv4();
    }
    
    // Set upload date if not provided
    if (!fileData.upload_date) {
      fileData.upload_date = new Date();
    }
    
    // Format dates before inserting
    const formattedData = { ...fileData };
    formattedData.upload_date = formatDateForMySQL(formattedData.upload_date);
    if (formattedData.last_accessed) {
      formattedData.last_accessed = formatDateForMySQL(formattedData.last_accessed);
    }

    const [result] = await pool.query(
      'INSERT INTO uploads SET ?',
      formattedData
    );
    
    return formattedData.id;
  },
  
  // Get all file uploads
  findAll: async () => {
    const [rows] = await pool.query('SELECT * FROM uploads ORDER BY upload_date DESC');
    return rows;
  },
  
  // Find uploads by user ID
  findByUserId: async (userId) => {
    const [rows] = await pool.query('SELECT * FROM uploads WHERE user_id = ? ORDER BY upload_date DESC', [userId]);
    return rows;
  },
  
  // Find uploads by employee ID
  findByEmployeeId: async (employeeId) => {
    const [rows] = await pool.query('SELECT * FROM uploads WHERE employee_id = ? ORDER BY upload_date DESC', [employeeId]);
    return rows;
  },
  
  // Find a file upload by ID
  findById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM uploads WHERE id = ?', [id]);
    return rows[0];
  },
  
  // Update last_accessed timestamp
  updateLastAccessed: async (id) => {
    const lastAccessed = formatDateForMySQL(new Date());
    const [result] = await pool.query(
      'UPDATE uploads SET last_accessed = ? WHERE id = ?',
      [lastAccessed, id]
    );
    return result.affectedRows;
  },
  
  // Update file description
  updateDescription: async (id, description) => {
    const [result] = await pool.query(
      'UPDATE uploads SET description = ? WHERE id = ?',
      [description, id]
    );
    return result.affectedRows;
  },
  
  // Delete a file upload record
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM uploads WHERE id = ?', [id]);
    return result.affectedRows;
  }
};

module.exports = Upload;