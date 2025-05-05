const { pool } = require('./config/db');

async function addTypeColumn() {
  console.log('Adding type column to tickets table...');
  
  try {
    await pool.query('ALTER TABLE tickets ADD COLUMN type VARCHAR(50) DEFAULT "Business" AFTER status');
    console.log('Type column added successfully!');
  } catch (error) {
    console.error('Error adding column:', error);
  } finally {
    process.exit();
  }
}

addTypeColumn();