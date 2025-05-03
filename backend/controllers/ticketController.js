const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Get all tickets
exports.getAllTickets = async (req, res) => {
  try {
    const query = `
      SELECT 
        t.*,
        e.name as employee_name,
        a.name as airline_name
      FROM tickets t
      LEFT JOIN employees e ON t.employee_id = e.id
      LEFT JOIN airlines a ON t.airline_id = a.id
      ORDER BY t.created_at DESC
    `;
    const [tickets] = await db.query(query);
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ message: 'Failed to fetch tickets', error: error.message });
  }
};

// Get ticket by ID
exports.getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        t.*,
        e.name as employee_name,
        a.name as airline_name
      FROM tickets t
      LEFT JOIN employees e ON t.employee_id = e.id
      LEFT JOIN airlines a ON t.airline_id = a.id
      WHERE t.id = ?
    `;
    
    const [tickets] = await db.query(query, [id]);
    
    if (tickets.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    res.status(200).json(tickets[0]);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ message: 'Failed to fetch ticket', error: error.message });
  }
};

// Create a new ticket
exports.createTicket = async (req, res) => {
  try {
    const {
      employee_id,
      airline_id,
      reference,
      origin,
      destination,
      departure_date,
      return_date,
      cost,
      currency,
      booking_reference,
      status,
      notes
    } = req.body;

    if (!employee_id || !airline_id || !reference || !origin || !destination || !departure_date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const id = uuidv4();
    const now = new Date();

    const query = `
      INSERT INTO tickets (
        id, employee_id, airline_id, reference, origin, destination, 
        departure_date, return_date, cost, currency, booking_reference, 
        status, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(query, [
      id,
      employee_id,
      airline_id,
      reference,
      origin,
      destination,
      departure_date,
      return_date || null,
      cost || null,
      currency || 'USD',
      booking_reference || null,
      status || 'Active',
      notes || null,
      now,
      now
    ]);

    // Return the newly created ticket
    const [newTicket] = await db.query('SELECT * FROM tickets WHERE id = ?', [id]);
    res.status(201).json(newTicket[0]);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ message: 'Failed to create ticket', error: error.message });
  }
};

// Update a ticket
exports.updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      employee_id,
      airline_id,
      reference,
      origin,
      destination,
      departure_date,
      return_date,
      cost,
      currency,
      booking_reference,
      status,
      notes
    } = req.body;

    if (!employee_id || !airline_id || !reference || !origin || !destination || !departure_date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if the ticket exists
    const [existingTicket] = await db.query('SELECT * FROM tickets WHERE id = ?', [id]);
    if (existingTicket.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const query = `
      UPDATE tickets SET
        employee_id = ?,
        airline_id = ?,
        reference = ?,
        origin = ?,
        destination = ?,
        departure_date = ?,
        return_date = ?,
        cost = ?,
        currency = ?,
        booking_reference = ?,
        status = ?,
        notes = ?,
        updated_at = ?
      WHERE id = ?
    `;

    await db.query(query, [
      employee_id,
      airline_id,
      reference,
      origin,
      destination,
      departure_date,
      return_date || null,
      cost || null,
      currency || 'USD',
      booking_reference || null,
      status || 'Active',
      notes || null,
      new Date(),
      id
    ]);

    // Return the updated ticket
    const [updatedTicket] = await db.query(`
      SELECT 
        t.*,
        e.name as employee_name,
        a.name as airline_name
      FROM tickets t
      LEFT JOIN employees e ON t.employee_id = e.id
      LEFT JOIN airlines a ON t.airline_id = a.id
      WHERE t.id = ?
    `, [id]);
    
    res.status(200).json(updatedTicket[0]);
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ message: 'Failed to update ticket', error: error.message });
  }
};

// Delete a ticket
exports.deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the ticket exists
    const [existingTicket] = await db.query('SELECT * FROM tickets WHERE id = ?', [id]);
    if (existingTicket.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    await db.query('DELETE FROM tickets WHERE id = ?', [id]);
    
    res.status(200).json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ message: 'Failed to delete ticket', error: error.message });
  }
};

// Get tickets for a specific employee
exports.getTicketsByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const query = `
      SELECT 
        t.*,
        e.name as employee_name,
        a.name as airline_name
      FROM tickets t
      LEFT JOIN employees e ON t.employee_id = e.id
      LEFT JOIN airlines a ON t.airline_id = a.id
      WHERE t.employee_id = ?
      ORDER BY t.departure_date DESC
    `;
    
    const [tickets] = await db.query(query, [employeeId]);
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching employee tickets:', error);
    res.status(500).json({ message: 'Failed to fetch employee tickets', error: error.message });
  }
};