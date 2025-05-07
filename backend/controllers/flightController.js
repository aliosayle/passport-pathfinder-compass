// Flight Controller
const { pool } = require('../config/db');

// Get all flights
exports.getAllFlights = async (req, res) => {
  try {
    const [flights] = await pool.query(`
      SELECT f.*, e.name as employee_name, a.name as airline_name
      FROM flights f
      LEFT JOIN employees e ON f.employee_id = e.id
      LEFT JOIN airlines a ON f.airline_id = a.id
      ORDER BY f.departure_date DESC
    `);
    
    res.status(200).json(flights);
  } catch (error) {
    console.error('Error getting flights:', error);
    res.status(500).json({ message: 'Error fetching flights', error: error.message });
  }
};

// Get flight by ID
exports.getFlightById = async (req, res) => {
  try {
    const [flights] = await pool.query(`
      SELECT f.*, e.name as employee_name, a.name as airline_name
      FROM flights f
      LEFT JOIN employees e ON f.employee_id = e.id
      LEFT JOIN airlines a ON f.airline_id = a.id
      WHERE f.id = ?
    `, [req.params.id]);
    
    if (flights.length === 0) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    
    res.status(200).json(flights[0]);
  } catch (error) {
    console.error('Error getting flight:', error);
    res.status(500).json({ message: 'Error fetching flight', error: error.message });
  }
};

// Get flights by employee ID
exports.getFlightsByEmployeeId = async (req, res) => {
  try {
    const [flights] = await pool.query(`
      SELECT f.*, e.name as employee_name, a.name as airline_name
      FROM flights f
      LEFT JOIN employees e ON f.employee_id = e.id
      LEFT JOIN airlines a ON f.airline_id = a.id
      WHERE f.employee_id = ?
      ORDER BY f.departure_date DESC
    `, [req.params.employeeId]);
    
    res.status(200).json(flights);
  } catch (error) {
    console.error('Error getting employee flights:', error);
    res.status(500).json({ message: 'Error fetching employee flights', error: error.message });
  }
};

// Create flight
exports.createFlight = async (req, res) => {
  try {
    const {
      id,
      employee_id,
      departure_date,
      return_date,
      destination,
      origin,
      airline_id,
      ticket_reference,
      flight_number,
      status,
      type,
      notes
    } = req.body;

    // Validate required fields
    if (!id || !employee_id || !departure_date || !destination || !origin || !airline_id || !ticket_reference || !status || !type) {
      return res.status(400).json({
        message: 'Missing required flight fields',
        required: ['id', 'employee_id', 'departure_date', 'destination', 'origin', 'airline_id', 'ticket_reference', 'status', 'type'],
        received: { id, employee_id, departure_date, destination, origin, airline_id, ticket_reference, status, type }
      });
    }

    // Format dates for MySQL
    const formattedDepartureDate = new Date(departure_date).toISOString().slice(0, 19).replace('T', ' ');
    const formattedReturnDate = return_date ? new Date(return_date).toISOString().slice(0, 19).replace('T', ' ') : null;
    const last_updated = new Date().toISOString().slice(0, 19).replace('T', ' ');

    try {
      const [result] = await pool.query(`
        INSERT INTO flights (
          id, employee_id, departure_date, return_date, destination,
          origin, airline_id, ticket_reference, flight_number, status, type, notes, last_updated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        employee_id,
        formattedDepartureDate,
        formattedReturnDate,
        destination,
        origin,
        airline_id,
        ticket_reference,
        flight_number || null,
        status,
        type,
        notes || null,
        last_updated
      ]);

      const [newFlight] = await pool.query('SELECT * FROM flights WHERE id = ?', [id]);
      
      if (newFlight.length === 0) {
        return res.status(500).json({ 
          message: 'Flight was created but could not be retrieved',
          flightId: id
        });
      }
      
      res.status(201).json(newFlight[0]);
    } catch (dbError) {
      console.error('Database error creating flight:', dbError);
      
      // Check for duplicate entry
      if (dbError.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          message: 'A flight with this ID already exists',
          error: dbError.message
        });
      }
      
      // Check for foreign key constraints
      if (dbError.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({
          message: 'Referenced entity does not exist (employee or airline)',
          error: dbError.message
        });
      }
      
      throw dbError; // Re-throw for the outer catch block
    }
  } catch (error) {
    console.error('Error creating flight:', error);
    res.status(500).json({
      message: 'Error creating flight',
      error: error.message,
      details: error.sqlMessage || 'Unknown database error'
    });
  }
};

// Update flight
exports.updateFlight = async (req, res) => {
  try {
    const {
      employee_id,
      departure_date,
      return_date,
      destination,
      origin,
      airline_id,
      ticket_reference,
      flight_number,
      status,
      type,
      notes
    } = req.body;

    const last_updated = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // Format dates properly for MySQL
    const formattedDepartureDate = departure_date ? new Date(departure_date).toISOString().slice(0, 19).replace('T', ' ') : null;
    const formattedReturnDate = return_date ? new Date(return_date).toISOString().slice(0, 19).replace('T', ' ') : null;

    await pool.query(`
      UPDATE flights SET
        employee_id = ?,
        departure_date = ?,
        return_date = ?,
        destination = ?,
        origin = ?,
        airline_id = ?,
        ticket_reference = ?,
        flight_number = ?,
        status = ?,
        type = ?,
        notes = ?,
        last_updated = ?
      WHERE id = ?
    `, [
      employee_id,
      formattedDepartureDate,
      formattedReturnDate,
      destination,
      origin,
      airline_id,
      ticket_reference,
      flight_number || null,
      status,
      type,
      notes || null,
      last_updated,
      req.params.id
    ]);

    const [updatedFlight] = await pool.query('SELECT * FROM flights WHERE id = ?', [req.params.id]);
    
    if (updatedFlight.length === 0) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    
    res.status(200).json(updatedFlight[0]);
  } catch (error) {
    console.error('Error updating flight:', error);
    res.status(500).json({ message: 'Error updating flight', error: error.message });
  }
};

// Update flight status only
exports.updateFlightStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const validStatuses = ['Pending', 'Completed', 'Cancelled', 'Delayed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status value', 
        validStatuses: validStatuses 
      });
    }

    const last_updated = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // First check if the flight exists
    const [flight] = await pool.query('SELECT * FROM flights WHERE id = ?', [req.params.id]);
    
    if (flight.length === 0) {
      return res.status(404).json({ message: 'Flight not found' });
    }

    // Update just the status
    await pool.query(`
      UPDATE flights SET
        status = ?,
        last_updated = ?
      WHERE id = ?
    `, [
      status,
      last_updated,
      req.params.id
    ]);

    const [updatedFlight] = await pool.query('SELECT * FROM flights WHERE id = ?', [req.params.id]);
    
    res.status(200).json(updatedFlight[0]);
  } catch (error) {
    console.error('Error updating flight status:', error);
    res.status(500).json({ message: 'Error updating flight status', error: error.message });
  }
};

// Delete flight
exports.deleteFlight = async (req, res) => {
  try {
    const [flight] = await pool.query('SELECT * FROM flights WHERE id = ?', [req.params.id]);
    
    if (flight.length === 0) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    
    await pool.query('DELETE FROM flights WHERE id = ?', [req.params.id]);
    
    res.status(200).json({ message: 'Flight deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Error deleting flight:', error);
    res.status(500).json({ message: 'Error deleting flight', error: error.message });
  }
};