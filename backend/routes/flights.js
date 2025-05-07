const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightController');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');

// Get all flights - Authentication disabled temporarily for testing
router.get('/', flightController.getAllFlights);

// Get flights by employee ID - Authentication disabled temporarily for testing
// Must be placed before the '/:id' route to avoid conflict
router.get('/employee/:employeeId', flightController.getFlightsByEmployeeId);

// Get flight by ID - Authentication disabled temporarily for testing
router.get('/:id', flightController.getFlightById);

// Create new flight - Authentication disabled temporarily for testing
router.post('/', flightController.createFlight);

// Update flight status - Authentication disabled temporarily for testing
// Must be placed before the general update route to avoid conflict
router.put('/:id/status', flightController.updateFlightStatus);

// Update flight - Authentication disabled temporarily for testing
router.put('/:id', flightController.updateFlight);

// Delete flight - Authentication disabled temporarily for testing
router.delete('/:id', flightController.deleteFlight);

module.exports = router;