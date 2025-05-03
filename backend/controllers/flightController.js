// Flight Controller
const db = require('../config/db');

// Get all flights
exports.getAllFlights = async (req, res) => {
  try {
    const [flights] = await db.query(`
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
    const [flights] = await db.query(`
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
    const [flights] = await db.query(`
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

    const last_updated = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const [result] = await db.query(`
      INSERT INTO flights (
        id, employee_id, departure_date, return_date, destination,
        origin, airline_id, ticket_reference, flight_number, status, type, notes, last_updated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      employee_id,
      departure_date,
      return_date || null,
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

    const [newFlight] = await db.query('SELECT * FROM flights WHERE id = ?', [id]);
    
    res.status(201).json(newFlight[0]);
  } catch (error) {
    console.error('Error creating flight:', error);
    res.status(500).json({ message: 'Error creating flight', error: error.message });
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

    await db.query(`
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
      departure_date,
      return_date || null,
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

    const [updatedFlight] = await db.query('SELECT * FROM flights WHERE id = ?', [req.params.id]);
    
    if (updatedFlight.length === 0) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    
    res.status(200).json(updatedFlight[0]);
  } catch (error) {
    console.error('Error updating flight:', error);
    res.status(500).json({ message: 'Error updating flight', error: error.message });
  }
};

// Delete flight
exports.deleteFlight = async (req, res) => {
  try {
    const [flight] = await db.query('SELECT * FROM flights WHERE id = ?', [req.params.id]);
    
    if (flight.length === 0) {
      return res.status(404).json({ message: 'Flight not found' });
    }
    
    await db.query('DELETE FROM flights WHERE id = ?', [req.params.id]);
    
    res.status(200).json({ message: 'Flight deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Error deleting flight:', error);
    res.status(500).json({ message: 'Error deleting flight', error: error.message });
  }
};