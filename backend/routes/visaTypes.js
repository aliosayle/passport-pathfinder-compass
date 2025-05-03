const express = require('express');
const router = express.Router();
const visaTypeController = require('../controllers/visaTypeController');
const { authenticateToken, authorizeRole } = require('../middlewares/auth');

// Get all visa types
router.get('/', visaTypeController.getAllVisaTypes);

// Get visa type by ID
router.get('/:id', visaTypeController.getVisaTypeById);

// Create new visa type
router.post('/', authenticateToken, authorizeRole(['Admin', 'HR']), visaTypeController.createVisaType);

// Update visa type
router.put('/:id', authenticateToken, authorizeRole(['Admin', 'HR']), visaTypeController.updateVisaType);

// Delete visa type
router.delete('/:id', authenticateToken, authorizeRole(['Admin']), visaTypeController.deleteVisaType);

module.exports = router;