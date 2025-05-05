const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { authenticateToken } = require('../middlewares/auth');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all tickets
router.get('/', ticketController.getAllTickets);

// Get tickets by status
router.get('/status', ticketController.getTicketsByStatus);

// Get tickets for a specific employee
router.get('/employee/:employeeId', ticketController.getTicketsByEmployeeId);

// Get ticket by ID
router.get('/:id', ticketController.getTicketById);

// Create a new ticket
router.post('/', ticketController.createTicket);

// Create flight from ticket
router.post('/:id/create-flight', ticketController.createFlightFromTicket);

// Update ticket status
router.put('/:id/status', ticketController.updateTicketStatus);

// Update a ticket
router.put('/:id', ticketController.updateTicket);

// Delete a ticket
router.delete('/:id', ticketController.deleteTicket);

module.exports = router;