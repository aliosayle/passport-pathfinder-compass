const User = require('../models/user');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'passport_pathfinder_secure_jwt_secret_2025';

const authController = {
  // Register a new user
  register: async (req, res) => {
    try {
      const { username, email, password, role } = req.body;
      
      // Basic validation
      if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email and password are required' });
      }
      
      // Check if user already exists
      const existingUserByUsername = await User.getByUsername(username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      
      const existingUserByEmail = await User.getByEmail(email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: 'Email is already registered' });
      }
      
      // Check if role is provided (only admins can create other admin users)
      let userRole = role || 'User';
      
      // If trying to create an admin user, check if the current user is an admin
      if (userRole === 'Admin' && (!req.user || req.user.role !== 'Admin')) {
        userRole = 'User'; // Default to user role if not an admin
      }
      
      // Create new user
      const userData = {
        username,
        email,
        password,
        role: userRole
      };
      
      const newUser = await User.create(userData);
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = newUser;
      
      res.status(201).json({
        message: 'User registered successfully',
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ message: 'Failed to register user', error: error.message });
    }
  },
  
  // User login
  login: async (req, res) => {
    try {
      console.log('Login attempt with data:', req.body);
      
      const { username, password } = req.body;
      
      // Basic validation
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }
      
      // Find user - first try by username
      console.log('Attempting to find user with username:', username);
      let user = null;
      
      try {
        // Check if input contains @ symbol, might be an email address
        if (username.includes('@')) {
          console.log('Username contains @, trying as email');
          user = await User.getByEmail(username);
        } else {
          user = await User.getByUsername(username);
        }
        console.log('User found:', user ? 'Yes' : 'No');
      } catch (dbError) {
        console.error('Database error when finding user:', dbError);
        return res.status(500).json({ message: 'Database error', error: dbError.message });
      }
      
      if (!user) {
        console.log('User not found with identifier:', username);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Verify password
      console.log('Verifying password...');
      let isPasswordValid;
      try {
        isPasswordValid = await User.verifyPassword(password, user.password);
        console.log('Password valid:', isPasswordValid ? 'Yes' : 'No');
      } catch (pwError) {
        console.error('Error during password verification:', pwError);
        return res.status(500).json({ message: 'Authentication error', error: pwError.message });
      }
      
      if (!isPasswordValid) {
        console.log('Invalid password for user:', username);
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Update last login timestamp
      console.log('Updating last login for user ID:', user.id);
      try {
        await User.updateLastLogin(user.id);
      } catch (updateError) {
        console.error('Error updating last login:', updateError);
        // Continue even if this fails
      }
      
      // Generate JWT token
      console.log('Generating JWT token');
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      console.log('Login successful for user:', username);
      res.status(200).json({
        message: 'Login successful',
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Unhandled error during login:', error);
      res.status(500).json({ message: 'Login failed', error: error.message });
    }
  },
  
  // Verify token and get current user info
  getCurrentUser: async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Find user
      const user = await User.getById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.status(200).json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
          last_login: user.last_login
        }
      });
    } catch (error) {
      console.error('Error getting current user:', error);
      res.status(500).json({ message: 'Failed to get user information', error: error.message });
    }
  }
};

module.exports = authController;