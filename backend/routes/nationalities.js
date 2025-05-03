const express = require('express');
const router = express.Router();
const nationalityController = require('../controllers/nationalityController');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');

// Get all nationalities
router.get('/', nationalityController.getAllNationalities);

// Get nationality by ID
router.get('/:id', nationalityController.getNationalityById);

// Create new nationality - Authentication disabled temporarily for testing
router.post('/', nationalityController.createNationality);

// Update nationality - Authentication disabled temporarily for testing
router.put('/:id', nationalityController.updateNationality);

// Delete nationality - Authentication disabled temporarily for testing
router.delete('/:id', nationalityController.deleteNationality);

module.exports = router;