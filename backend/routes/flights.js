const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightController');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');

// Get all flights - Authentication disabled temporarily for testing
router.get('/', flightController.getAllFlights);

// Get flight by ID - Authentication disabled temporarily for testing
router.get('/:id', flightController.getFlightById);

// Get flights by employee ID - Authentication disabled temporarily for testing
router.get('/employee/:employeeId', flightController.getFlightsByEmployeeId);

// Create new flight - Authentication disabled temporarily for testing
router.post('/', flightController.createFlight);

// Update flight - Authentication disabled temporarily for testing
router.put('/:id', flightController.updateFlight);

// Delete flight - Authentication disabled temporarily for testing
router.delete('/:id', flightController.deleteFlight);

module.exports = router;