const express = require('express');
const router = express.Router();
const airlineController = require('../controllers/airlineController');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');

// Get all airlines
router.get('/', airlineController.getAllAirlines);

// Get airline by ID
router.get('/:id', airlineController.getAirlineById);

// Create new airline
router.post('/', authenticateToken, authorizeRole(['Admin', 'Travel']), airlineController.createAirline);

// Update airline
router.put('/:id', authenticateToken, authorizeRole(['Admin', 'Travel']), airlineController.updateAirline);

// Delete airline
router.delete('/:id', authenticateToken, authorizeRole(['Admin']), airlineController.deleteAirline);

module.exports = router;