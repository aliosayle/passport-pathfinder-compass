const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

async function resetAdminPassword() {
  try {
    console.log('Starting admin password reset...');
    
    // Generate password hash for 'admin123'
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    console.log('Generated new password hash for admin123');
    
    // Update the admin user
    const [result] = await pool.query(
      `UPDATE users SET password = ? WHERE email = ? OR username = ?`,
      [hashedPassword, 'admin@example.com', 'admin']
    );
    
    if (result.affectedRows > 0) {
      console.log(`Success! Updated password for ${result.affectedRows} admin user(s)`);
      console.log('You can now log in with:');
      console.log('  Username: admin@example.com or admin');
      console.log('  Password: admin123');
    } else {
      console.log('No admin users found to update.');
      console.log('Creating a new admin user...');
      
      // Create a new admin user if none exists
      const [createResult] = await pool.query(
        `INSERT INTO users (id, username, email, password, role) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          'ADMIN001',
          'admin', 
          'admin@example.com', 
          hashedPassword, 
          'Admin'
        ]
      );
      
      if (createResult.affectedRows > 0) {
        console.log('Admin user created successfully!');
        console.log('You can now log in with:');
        console.log('  Username: admin@example.com or admin');
        console.log('  Password: admin123');
      } else {
        console.log('Failed to create admin user');
      }
    }
    
  } catch (error) {
    console.error('Error resetting admin password:', error);
  } finally {
    // Close the connection pool
    await pool.end();
    process.exit(0);
  }
}

// Run the password reset
resetAdminPassword();