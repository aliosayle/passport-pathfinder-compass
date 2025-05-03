const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');

// Get all employees
router.get('/', employeeController.getAllEmployees);

// Get employee by ID
router.get('/:id', employeeController.getEmployeeById);

// Create new employee - Authentication disabled temporarily for testing
router.post('/', employeeController.createEmployee);

// Update employee - Authentication disabled temporarily for testing
router.put('/:id', employeeController.updateEmployee);

// Delete employee - Authentication disabled temporarily for testing
router.delete('/:id', employeeController.deleteEmployee);

module.exports = router;