const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

async function testUserCredentials(username, password) {
  try {
    console.log(`Testing credentials for user: ${username}`);
    
    // Find the user
    const [users] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?', 
      [username, username]
    );
    
    if (users.length === 0) {
      console.log('No user found with this username/email');
      return false;
    }
    
    const user = users[0];
    console.log('User found:', {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      password_hash_excerpt: user.password.substring(0, 20) + '...' // Only show part of the hash for security
    });
    
    // Test password
    const passwordValid = await bcrypt.compare(password, user.password);
    console.log(`Password '${password}' is ${passwordValid ? 'VALID' : 'INVALID'}`);
    
    // Generate new hash for the given password (for reference)
    const newHash = await bcrypt.hash(password, 10);
    console.log(`New hash that would be generated for '${password}':`, newHash);
    
    return passwordValid;
  } catch (error) {
    console.error('Error testing credentials:', error);
    return false;
  } finally {
    // Close the connection pool
    await pool.end();
  }
}

// Test with admin credentials
testUserCredentials('admin@example.com', 'admin123')
  .then(result => {
    console.log('Authentication test result:', result ? 'SUCCESS' : 'FAILURE');
    process.exit(0);
  })
  .catch(error => {
    console.error('Test failed with error:', error);
    process.exit(1);
  });