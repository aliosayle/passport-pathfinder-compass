const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');
const { pool } = require('../config/db');
const User = require('../models/user');

// Register a new user
router.post('/register', authController.register);

// User login
router.post('/login', authController.login);

// Get current user from token
router.get('/me', authenticateToken, authController.getCurrentUser);

// Diagnostic route for testing database connectivity
router.get('/test-db', async (req, res) => {
  try {
    // Test 1: Basic connection
    console.log('Testing database connection...');
    const connection = await pool.getConnection();
    console.log('Successfully connected to database!');
    
    // Test 2: Query the users table
    console.log('Testing query to users table...');
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM users');
    console.log('Query result:', rows);
    
    connection.release();
    
    res.status(200).json({ 
      message: 'Database connection successful', 
      userCount: rows[0].count 
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      message: 'Database connection failed',
      error: error.message,
      stack: error.stack
    });
  }
});

// Diagnostic route for listing users (use with caution in production)
router.get('/test-users', async (req, res) => {
  try {
    console.log('Attempting to list all users...');
    
    // Direct database query to see raw users data
    const [rows] = await pool.query('SELECT id, username, email, role FROM users LIMIT 5');
    
    // Check if any users exist
    if (rows.length === 0) {
      console.log('No users found in database!');
      return res.status(404).json({ message: 'No users found in database' });
    }
    
    console.log(`Found ${rows.length} users`);
    
    // Test User model methods
    console.log('Testing User.getByUsername with admin...');
    const adminUser = await User.getByUsername('admin');
    
    res.status(200).json({
      message: 'Users retrieved successfully',
      usersCount: rows.length,
      sampleUsers: rows,
      adminExists: !!adminUser
    });
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({
      message: 'Failed to list users',
      error: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;