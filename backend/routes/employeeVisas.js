const express = require('express');
const router = express.Router();
const employeeVisaController = require('../controllers/employeeVisaController');
const auth = require('../middlewares/auth');

// Routes require authentication
router.use(auth.authenticateToken);

// Get all employee visas
router.get('/', employeeVisaController.getAllVisas);

// Get visas expiring within X days
router.get('/expiring/:days', employeeVisaController.getExpiringVisas);

// Get visas for a specific employee
router.get('/employee/:employeeId', employeeVisaController.getVisasByEmployeeId);

// Get an employee visa by ID
router.get('/:id', employeeVisaController.getVisaById);

// Create a new employee visa
router.post('/', employeeVisaController.createVisa);

// Update an employee visa
router.put('/:id', employeeVisaController.updateVisa);

// Delete an employee visa
router.delete('/:id', employeeVisaController.deleteVisa);

module.exports = router;