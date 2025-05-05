const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');

// Apply authentication to all user routes
router.use(authenticateToken);

// Apply admin authorization to all user management routes
router.use(authorizeRole(['Admin']));

// Get all users (Admin only)
router.get('/', userController.getAllUsers);

// Get user by ID (Admin only)
router.get('/:id', userController.getUserById);

// Create new user (Admin only)
router.post('/', userController.createUser);

// Update user (Admin only)
router.put('/:id', userController.updateUser);

// Delete user (Admin only)
router.delete('/:id', userController.deleteUser);

module.exports = router;