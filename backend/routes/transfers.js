const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middlewares/auth');
const transferController = require('../controllers/transferController');

// Get all transfers - requires authentication
router.get('/', authenticateToken, transferController.getAllTransfers);

// Get transfers for a specific employee - MOVED UP before the :id route
router.get('/employee/:employeeId', authenticateToken, transferController.getTransfersByEmployeeId);

// Get transfer by ID
router.get('/:id', authenticateToken, transferController.getTransferById);

// Create new transfer
router.post('/', authenticateToken, transferController.createTransfer);

// Update transfer status
router.patch('/:id/status', authenticateToken, transferController.updateTransferStatus);

// Mark transfer as completed
router.patch('/:id/complete', authenticateToken, transferController.completeTransfer);

module.exports = router;