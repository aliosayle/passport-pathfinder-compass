// Script to add employee_visas table to the database
require('dotenv').config();
const { pool } = require('./config/db');

async function addEmployeeVisasTable() {
  try {
    console.log('Creating employee_visas table...');
    
    const sql = `
      CREATE TABLE IF NOT EXISTS employee_visas (
        id VARCHAR(36) NOT NULL,
        visa_type_id VARCHAR(36) NOT NULL,
        employee_id VARCHAR(10) NOT NULL,
        employee_name VARCHAR(100) NOT NULL,
        issue_date DATE NOT NULL,
        expiry_date DATE NOT NULL,
        status ENUM('Valid', 'Expired', 'Cancelled', 'Processing') NOT NULL DEFAULT 'Valid',
        document_number VARCHAR(50),
        notes TEXT,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (visa_type_id) REFERENCES visa_types(id),
        INDEX (expiry_date),
        INDEX (status)
      )
    `;
    
    const [result] = await pool.query(sql);
    console.log('Employee_visas table created successfully!');
    console.log(result);
    
    // Check if the table was created successfully
    const [tables] = await pool.query('SHOW TABLES LIKE "employee_visas"');
    if (tables.length > 0) {
      console.log('Confirmed table employee_visas exists in database.');
    } else {
      console.log('Warning: Could not confirm table creation.');
    }
    
  } catch (error) {
    console.error('Error creating employee_visas table:', error);
  } finally {
    // Close the pool to end the script
    pool.end();
  }
}

// Run the script
addEmployeeVisasTable();