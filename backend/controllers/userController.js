const User = require('../models/user');

const userController = {
  // Get all users (Admin only)
  getAllUsers: async (req, res) => {
    try {
      const users = await User.getAll();
      res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Failed to fetch users', error: error.message });
    }
  },

  // Get user by ID (Admin only)
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.getById(id);
      
      if (!user) {
        return res.status(404).json({ message: `User with ID ${id} not found` });
      }
      
      res.status(200).json(user);
    } catch (error) {
      console.error(`Error fetching user ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to fetch user', error: error.message });
    }
  },

  // Create new user (Admin only)
  createUser: async (req, res) => {
    try {
      const userData = req.body;
      
      // Basic validation
      if (!userData.username || !userData.email || !userData.password) {
        return res.status(400).json({ 
          message: 'Username, email, and password are required' 
        });
      }
      
      // Check if username already exists
      const existingUsername = await User.getByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      // Check if email already exists
      const existingEmail = await User.getByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      
      const newUser = await User.create(userData);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json({ 
        message: 'User created successfully', 
        user: userWithoutPassword 
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ message: 'Failed to create user', error: error.message });
    }
  },

  // Update user (Admin only)
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const userData = req.body;
      
      // Check if user exists
      const existingUser = await User.getById(id);
      if (!existingUser) {
        return res.status(404).json({ message: `User with ID ${id} not found` });
      }
      
      // If changing username, check if it already exists
      if (userData.username && userData.username !== existingUser.username) {
        const existingUsername = await User.getByUsername(userData.username);
        if (existingUsername) {
          return res.status(400).json({ message: 'Username already exists' });
        }
      }
      
      // If changing email, check if it already exists
      if (userData.email && userData.email !== existingUser.email) {
        const existingEmail = await User.getByEmail(userData.email);
        if (existingEmail) {
          return res.status(400).json({ message: 'Email already exists' });
        }
      }
      
      const updated = await User.update(id, userData);
      
      if (updated) {
        const updatedUser = await User.getById(id);
        res.status(200).json({ 
          message: 'User updated successfully',
          user: updatedUser 
        });
      } else {
        res.status(400).json({ message: 'Failed to update user' });
      }
    } catch (error) {
      console.error(`Error updating user ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to update user', error: error.message });
    }
  },

  // Delete user (Admin only)
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if user exists
      const existingUser = await User.getById(id);
      if (!existingUser) {
        return res.status(404).json({ message: `User with ID ${id} not found` });
      }
      
      // Prevent deleting yourself
      if (req.user.id === id) {
        return res.status(400).json({ message: "You cannot delete your own account" });
      }
      
      const deleted = await User.delete(id);
      
      if (deleted) {
        res.status(200).json({ message: 'User deleted successfully' });
      } else {
        res.status(400).json({ message: 'Failed to delete user' });
      }
    } catch (error) {
      console.error(`Error deleting user ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to delete user', error: error.message });
    }
  }
};

module.exports = userController;