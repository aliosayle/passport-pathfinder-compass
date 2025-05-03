const express = require('express');
const router = express.Router();
const passportController = require('../controllers/passportController');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');

// Get all passports
router.get('/', passportController.getAllPassports);

// Get passport by ID
router.get('/:id', passportController.getPassportById);

// Get passports expiring within X days
router.get('/expiring/:days', passportController.getExpiringPassports);

// Create new passport - Authentication disabled temporarily for testing
router.post('/', passportController.createPassport);

// Update passport - Authentication disabled temporarily for testing
router.put('/:id', passportController.updatePassport);

// Delete passport - Authentication disabled temporarily for testing
router.delete('/:id', passportController.deletePassport);

module.exports = router;