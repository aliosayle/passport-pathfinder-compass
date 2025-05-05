const { pool } = require('./config/db');

async function addFlightColumns() {
  console.log('Adding missing columns to flights table...');
  
  try {
    // Check which columns exist in the flights table
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'flights'
    `);
    
    const existingColumns = columns.map(col => col.COLUMN_NAME.toLowerCase());
    console.log('Existing columns:', existingColumns);
    
    // Add columns that don't exist yet
    const columnsToAdd = [];
    
    if (!existingColumns.includes('ticket_id')) {
      columnsToAdd.push("ADD COLUMN ticket_id VARCHAR(36) AFTER id");
    }
    
    if (!existingColumns.includes('employee_name')) {
      columnsToAdd.push("ADD COLUMN employee_name VARCHAR(100) AFTER employee_id");
    }
    
    if (!existingColumns.includes('ticket_reference')) {
      columnsToAdd.push("ADD COLUMN ticket_reference VARCHAR(50) AFTER airline_name");
    }
    
    if (!existingColumns.includes('is_return')) {
      columnsToAdd.push("ADD COLUMN is_return BOOLEAN DEFAULT false AFTER flight_number");
    }
    
    if (!existingColumns.includes('type')) {
      columnsToAdd.push("ADD COLUMN type VARCHAR(50) DEFAULT 'Business' AFTER status");
    }
    
    if (columnsToAdd.length > 0) {
      const alterQuery = `ALTER TABLE flights ${columnsToAdd.join(', ')}`;
      console.log('Executing query:', alterQuery);
      await pool.query(alterQuery);
      console.log('Missing flight columns added successfully!');
    } else {
      console.log('No columns to add - all needed columns already exist.');
    }
    
  } catch (error) {
    console.error('Error adding columns:', error);
  } finally {
    process.exit();
  }
}

addFlightColumns();