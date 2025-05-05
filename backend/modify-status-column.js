const { pool } = require('./config/db');

async function modifyStatusColumn() {
  console.log('Modifying status column in tickets table...');
  
  try {
    // First, let's check the current status column definition
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, CHARACTER_MAXIMUM_LENGTH 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'tickets' 
      AND COLUMN_NAME = 'status'
    `);
    
    console.log('Current status column definition:', columns[0]);
    
    // Modify the status column to be larger (VARCHAR(20) should be sufficient)
    await pool.query(`
      ALTER TABLE tickets 
      MODIFY COLUMN status VARCHAR(20) NOT NULL
    `);
    
    console.log('Status column successfully modified to VARCHAR(20)');
  } catch (error) {
    console.error('Error modifying status column:', error);
  } finally {
    process.exit();
  }
}

modifyStatusColumn();