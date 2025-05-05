const { pool } = require('./config/db');

async function addTicketColumns() {
  console.log('Adding missing columns to tickets table...');
  
  try {
    // Check if has_return column exists, if not add it
    await pool.query(`
      ALTER TABLE tickets 
      ADD COLUMN has_return BOOLEAN DEFAULT false AFTER type,
      ADD COLUMN departure_completed BOOLEAN DEFAULT false AFTER has_return,
      ADD COLUMN return_completed BOOLEAN DEFAULT false AFTER departure_completed
    `);
    console.log('Missing ticket columns added successfully!');
  } catch (error) {
    console.error('Error adding columns:', error);
  } finally {
    process.exit();
  }
}

addTicketColumns();