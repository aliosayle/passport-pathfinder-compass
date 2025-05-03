const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middlewares/auth');
const ticketController = require('../controllers/ticketController');

// Get all tickets
router.get('/', ticketController.getAllTickets);

// Get ticket by ID
router.get('/:id', ticketController.getTicketById);

// Get tickets by employee ID
router.get('/employee/:employeeId', ticketController.getTicketsByEmployeeId);

// Create new ticket
router.post('/', ticketController.createTicket);

// Update ticket
router.put('/:id', ticketController.updateTicket);

// Delete ticket
router.delete('/:id', ticketController.deleteTicket);

module.exports = router;