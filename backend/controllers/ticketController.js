const { pool } = require('../config/db');
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
      ORDER BY t.departure_date DESC
    `;
    const [tickets] = await pool.query(query);
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ message: 'Failed to fetch tickets', error: error.message });
  }
};

// Get tickets by status
exports.getTicketsByStatus = async (req, res) => {
  try {
    const { status } = req.query;
    
    if (!status) {
      return res.status(400).json({ message: 'Status parameter is required' });
    }
    
    const query = `
      SELECT 
        t.*,
        e.name as employee_name,
        a.name as airline_name
      FROM tickets t
      LEFT JOIN employees e ON t.employee_id = e.id
      LEFT JOIN airlines a ON t.airline_id = a.id
      WHERE t.status = ?
      ORDER BY t.departure_date ASC
    `;
    
    const [tickets] = await pool.query(query, [status]);
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching tickets by status:', error);
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
    
    const [tickets] = await pool.query(query, [id]);
    
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
      employee_name,
      airline_id,
      airline_name,
      reference,
      origin,
      destination,
      departure_date,
      return_date,
      cost,
      currency,
      flight_number,
      status,
      type,
      notes,
      issue_date
    } = req.body;

    if (!employee_id || !airline_id || !reference || !origin || !destination || !departure_date) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['employee_id', 'airline_id', 'reference', 'origin', 'destination', 'departure_date'],
        received: req.body 
      });
    }

    const id = req.body.id || uuidv4();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const formattedIssueDate = issue_date ? new Date(issue_date).toISOString().slice(0, 10) : now.slice(0, 10);
    const hasReturn = return_date ? 1 : 0;
    const ticketType = type || 'Business';
    const ticketStatus = status || 'Pending';

    // Use the correct column names as defined in the database schema
    const query = `
      INSERT INTO tickets (
        id, employee_id, employee_name, airline_id, airline_name, reference, 
        origin, destination, departure_date, return_date, cost, currency, 
        flight_number, status, type, has_return, departure_completed, return_completed,
        notes, issue_date, last_updated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await pool.query(query, [
      id,
      employee_id,
      employee_name || '',  // Provide a default empty string if not provided
      airline_id,
      airline_name || '',   // Provide a default empty string if not provided
      reference,
      origin,
      destination,
      departure_date,
      return_date || null,
      cost || null,
      currency || 'USD',
      flight_number || null,
      ticketStatus,
      ticketType,
      hasReturn,
      false, // departure_completed
      false, // return_completed
      notes || null,
      formattedIssueDate,
      now
    ]);

    // Return the newly created ticket
    const [newTicket] = await pool.query('SELECT * FROM tickets WHERE id = ?', [id]);
    res.status(201).json(newTicket[0]);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ 
      message: 'Failed to create ticket', 
      error: error.message,
      sqlMessage: error.sqlMessage,
      code: error.code 
    });
  }
};

// Update a ticket
exports.updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      employee_id,
      employee_name,
      airline_id,
      airline_name,
      reference,
      origin,
      destination,
      departure_date,
      return_date,
      cost,
      currency,
      flight_number,
      status,
      notes,
      issue_date
    } = req.body;

    if (!employee_id || !airline_id || !reference || !origin || !destination || !departure_date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if the ticket exists
    const [existingTicket] = await pool.query('SELECT * FROM tickets WHERE id = ?', [id]);
    if (existingTicket.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const formattedIssueDate = issue_date ? new Date(issue_date).toISOString().slice(0, 10) : null;

    // Use the correct column names as defined in the database schema
    const query = `
      UPDATE tickets SET
        employee_id = ?,
        employee_name = ?,
        airline_id = ?,
        airline_name = ?,
        reference = ?,
        origin = ?,
        destination = ?,
        departure_date = ?,
        return_date = ?,
        cost = ?,
        currency = ?,
        flight_number = ?,
        status = ?,
        notes = ?,
        issue_date = COALESCE(?, issue_date),
        last_updated = ?
      WHERE id = ?
    `;

    await pool.query(query, [
      employee_id,
      employee_name || existingTicket[0].employee_name,
      airline_id,
      airline_name || existingTicket[0].airline_name,
      reference,
      origin,
      destination,
      departure_date,
      return_date || null,
      cost || null,
      currency || 'USD',
      flight_number || null,
      status || 'Active',
      notes || null,
      formattedIssueDate,
      now,
      id
    ]);

    // Return the updated ticket
    const [updatedTicket] = await pool.query('SELECT * FROM tickets WHERE id = ?', [id]);
    
    res.status(200).json(updatedTicket[0]);
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ 
      message: 'Failed to update ticket', 
      error: error.message,
      sqlMessage: error.sqlMessage,
      code: error.code 
    });
  }
};

// Update ticket status
exports.updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    // Validate status
    const validStatuses = ['Pending', 'Active', 'Used', 'Completed', 'Cancelled', 'Delayed', 'Rescheduled', 'Expired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status value', 
        validValues: validStatuses 
      });
    }
    
    // Check if the ticket exists
    const [existingTicket] = await pool.query('SELECT * FROM tickets WHERE id = ?', [id]);
    if (existingTicket.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // Update ticket status
    const query = `
      UPDATE tickets SET
        status = ?,
        notes = CONCAT(IFNULL(notes, ''), '\n\n', ?),
        last_updated = ?
      WHERE id = ?
    `;
    
    const statusNote = `[${now}] Status changed to ${status}${notes ? ': ' + notes : ''}`;
    
    await pool.query(query, [
      status,
      statusNote,
      now,
      id
    ]);
    
    // Get the updated ticket
    const [updatedTicket] = await pool.query('SELECT * FROM tickets WHERE id = ?', [id]);
    
    res.status(200).json(updatedTicket[0]);
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({ message: 'Failed to update ticket status', error: error.message });
  }
};

// Delete a ticket
exports.deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the ticket exists
    const [existingTicket] = await pool.query('SELECT * FROM tickets WHERE id = ?', [id]);
    if (existingTicket.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    await pool.query('DELETE FROM tickets WHERE id = ?', [id]);
    
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
    
    const [tickets] = await pool.query(query, [employeeId]);
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error fetching employee tickets:', error);
    res.status(500).json({ message: 'Failed to fetch employee tickets', error: error.message });
  }
};

// Create flight from ticket
exports.createFlightFromTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { isReturn = false } = req.body;
    
    // Check if the ticket exists
    const [ticketResult] = await pool.query('SELECT * FROM tickets WHERE id = ?', [id]);
    if (ticketResult.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    const ticket = ticketResult[0];
    
    // Check if a flight can be created
    if (isReturn) {
      // For return flight
      if (!ticket.return_date) {
        return res.status(400).json({ message: 'Ticket does not have a return date' });
      }
      
      if (ticket.return_completed) {
        return res.status(400).json({ message: 'Return flight already processed' });
      }
      
      if (!ticket.departure_completed) {
        return res.status(400).json({ message: 'Departure flight must be completed first' });
      }
    } else {
      // For departure flight
      if (ticket.departure_completed) {
        return res.status(400).json({ message: 'Departure flight already processed' });
      }
    }
    
    // Generate flight ID
    const flightId = `FL${uuidv4().split('-')[0]}`;
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // Create the flight
    const createFlightQuery = `
      INSERT INTO flights (
        id, ticket_id, employee_name, employee_id, departure_date, return_date,
        destination, origin, airline_id, airline_name, ticket_reference,
        flight_number, is_return, status, type, notes, last_updated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    // If it's a return flight, swap origin and destination
    const departureDate = isReturn ? ticket.return_date : ticket.departure_date;
    const origin = isReturn ? ticket.destination : ticket.origin;
    const destination = isReturn ? ticket.origin : ticket.destination;
    
    await pool.query(createFlightQuery, [
      flightId,
      ticket.id,
      ticket.employee_name,
      ticket.employee_id,
      departureDate,
      null, // No return date for the flight (it's in the ticket)
      destination,
      origin,
      ticket.airline_id,
      ticket.airline_name,
      ticket.reference,
      ticket.flight_number,
      isReturn,
      'Pending',
      ticket.type || 'Business',
      `Created from ticket ${ticket.reference}`,
      now
    ]);
    
    // Update ticket with flight information
    let updateTicketQuery;
    let ticketStatus;
    const updateParams = [];
    
    if (isReturn) {
      // Update return flight info
      updateTicketQuery = `
        UPDATE tickets SET
          return_flight_id = ?,
          return_completed = true,
          status = ?,
          last_updated = ?
        WHERE id = ?
      `;
      
      ticketStatus = 'Completed'; // Both legs now processed
      updateParams.push(flightId, ticketStatus, now, ticket.id);
    } else {
      // Update departure flight info
      updateTicketQuery = `
        UPDATE tickets SET
          departure_flight_id = ?,
          departure_completed = true,
          status = ?,
          last_updated = ?
        WHERE id = ?
      `;
      
      // If there's a return date, set status to Active, otherwise Completed
      ticketStatus = ticket.return_date ? 'Active' : 'Completed';
      updateParams.push(flightId, ticketStatus, now, ticket.id);
    }
    
    await pool.query(updateTicketQuery, updateParams);
    
    // Get the created flight
    const [createdFlight] = await pool.query('SELECT * FROM flights WHERE id = ?', [flightId]);
    
    res.status(201).json({
      flight: createdFlight[0],
      message: `${isReturn ? 'Return' : 'Departure'} flight created successfully`
    });
  } catch (error) {
    console.error('Error creating flight from ticket:', error);
    res.status(500).json({ message: 'Failed to create flight', error: error.message });
  }
};