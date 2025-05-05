const db = require('../config/db');
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');

// Helper function to generate PDF reports
const generatePDF = async (data, res) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new PDFDocument({ margin: 50 });
      
      // Pipe the PDF into the response
      doc.pipe(res);
      
      // Add content to the PDF
      doc.fontSize(25).text('User Report', { align: 'center' });
      doc.moveDown();
      
      // Add user info
      const user = data.user;
      doc.fontSize(14).text(`User: ${user.username}`, { underline: true });
      doc.fontSize(12).text(`Email: ${user.email}`);
      doc.fontSize(12).text(`Role: ${user.role}`);
      doc.fontSize(12).text(`Created: ${new Date(user.created_at).toLocaleDateString()}`);
      doc.moveDown();
      
      // Add passport information if available
      if (data.passports && data.passports.length > 0) {
        doc.fontSize(14).text('Passports', { underline: true });
        data.passports.forEach(passport => {
          doc.fontSize(12).text(`Passport Number: ${passport.passport_number}`);
          doc.fontSize(12).text(`Full Name: ${passport.full_name}`);
          doc.fontSize(12).text(`Issue Date: ${new Date(passport.issue_date).toLocaleDateString()}`);
          doc.fontSize(12).text(`Expiry Date: ${new Date(passport.expiry_date).toLocaleDateString()}`);
          doc.moveDown();
        });
      }
      
      // Add flight information if available
      if (data.flights && data.flights.length > 0) {
        doc.fontSize(14).text('Flights', { underline: true });
        data.flights.forEach(flight => {
          doc.fontSize(12).text(`Flight ID: ${flight.id}`);
          doc.fontSize(12).text(`Airline: ${flight.airline_name || flight.airline_id}`);
          doc.fontSize(12).text(`Departure: ${new Date(flight.departure_date).toLocaleDateString()}`);
          if (flight.return_date) {
            doc.fontSize(12).text(`Return: ${new Date(flight.return_date).toLocaleDateString()}`);
          }
          doc.fontSize(12).text(`Status: ${flight.status}`);
          doc.moveDown();
        });
      }
      
      // Add ticket information if available
      if (data.tickets && data.tickets.length > 0) {
        doc.fontSize(14).text('Tickets', { underline: true });
        data.tickets.forEach(ticket => {
          doc.fontSize(12).text(`Ticket ID: ${ticket.id}`);
          doc.fontSize(12).text(`Type: ${ticket.ticket_type}`);
          doc.fontSize(12).text(`Status: ${ticket.status}`);
          doc.fontSize(12).text(`Created: ${new Date(ticket.created_at).toLocaleDateString()}`);
          doc.moveDown();
        });
      }
      
      // Add transfer information if available
      if (data.transfers && data.transfers.length > 0) {
        doc.fontSize(14).text('Money Transfers', { underline: true });
        data.transfers.forEach(transfer => {
          doc.fontSize(12).text(`Transfer ID: ${transfer.id}`);
          doc.fontSize(12).text(`Amount: $${transfer.amount.toFixed(2)}`);
          doc.fontSize(12).text(`Type: ${transfer.transfer_type}`);
          doc.fontSize(12).text(`Status: ${transfer.status}`);
          doc.fontSize(12).text(`Date: ${new Date(transfer.created_at).toLocaleDateString()}`);
          doc.moveDown();
        });
      }
      
      // Finalize the PDF and end the stream
      doc.end();
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

// Helper function to generate CSV reports
const generateCSV = async (data, res) => {
  try {
    // Prepare data for CSV
    let fields = [];
    let csvData = [];
    
    // Process user data
    const userData = {
      record_type: 'USER',
      user_id: data.user.id,
      username: data.user.username,
      email: data.user.email,
      role: data.user.role,
      created_at: data.user.created_at,
      last_login: data.user.last_login || ''
    };
    csvData.push(userData);
    
    // Process passport data if available
    if (data.passports && data.passports.length > 0) {
      data.passports.forEach(passport => {
        csvData.push({
          record_type: 'PASSPORT',
          passport_id: passport.id,
          passport_number: passport.passport_number,
          full_name: passport.full_name,
          nationality: passport.nationality,
          issue_date: passport.issue_date,
          expiry_date: passport.expiry_date
        });
      });
    }
    
    // Process flight data if available
    if (data.flights && data.flights.length > 0) {
      data.flights.forEach(flight => {
        csvData.push({
          record_type: 'FLIGHT',
          flight_id: flight.id,
          airline: flight.airline_name || flight.airline_id,
          departure_date: flight.departure_date,
          return_date: flight.return_date || '',
          status: flight.status
        });
      });
    }
    
    // Process ticket data if available
    if (data.tickets && data.tickets.length > 0) {
      data.tickets.forEach(ticket => {
        csvData.push({
          record_type: 'TICKET',
          ticket_id: ticket.id,
          ticket_type: ticket.ticket_type,
          status: ticket.status,
          created_at: ticket.created_at
        });
      });
    }
    
    // Process transfer data if available
    if (data.transfers && data.transfers.length > 0) {
      data.transfers.forEach(transfer => {
        csvData.push({
          record_type: 'TRANSFER',
          transfer_id: transfer.id,
          amount: transfer.amount,
          transfer_type: transfer.transfer_type,
          status: transfer.status,
          created_at: transfer.created_at
        });
      });
    }
    
    // Get all possible fields from first record
    if (csvData.length > 0) {
      fields = Object.keys(csvData[0]);
    }
    
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(csvData);
    
    res.attachment(`user_report_${data.user.id}.csv`);
    res.status(200).send(csv);
    
  } catch (error) {
    throw error;
  }
};

// Get user report data
exports.getUserReport = async (req, res) => {
  const userId = req.params.userId;
  const { 
    includeFlights = true,
    includeTickets = true,
    includePassports = true,
    includeTransfers = true,
    startDate,
    endDate
  } = req.query;
  
  try {
    // Get user info
    const [user] = await db.query(
      `SELECT id, username, email, role, created_at, last_login FROM users WHERE id = ?`,
      [userId]
    );
    
    if (!user.length) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const reportData = {
      user: user[0]
    };
    
    // Add date filter to queries if provided
    let dateFilter = '';
    const dateParams = [];
    
    if (startDate && endDate) {
      dateFilter = 'AND created_at BETWEEN ? AND ?';
      dateParams.push(startDate, endDate);
    } else if (startDate) {
      dateFilter = 'AND created_at >= ?';
      dateParams.push(startDate);
    } else if (endDate) {
      dateFilter = 'AND created_at <= ?';
      dateParams.push(endDate);
    }
    
    // Get passport data if requested
    if (includePassports === 'true' || includePassports === true) {
      const [passports] = await db.query(
        `SELECT * FROM passports WHERE user_id = ? ${dateFilter}`,
        [userId, ...dateParams]
      );
      reportData.passports = passports;
    }
    
    // Get flight data if requested
    if (includeFlights === 'true' || includeFlights === true) {
      const [flights] = await db.query(
        `SELECT f.*, a.name as airline_name 
         FROM flights f
         LEFT JOIN airlines a ON f.airline_id = a.id
         WHERE f.user_id = ? ${dateFilter}`,
        [userId, ...dateParams]
      );
      reportData.flights = flights;
    }
    
    // Get ticket data if requested
    if (includeTickets === 'true' || includeTickets === true) {
      const [tickets] = await db.query(
        `SELECT * FROM tickets WHERE user_id = ? ${dateFilter}`,
        [userId, ...dateParams]
      );
      reportData.tickets = tickets;
    }
    
    // Get transfer data if requested
    if (includeTransfers === 'true' || includeTransfers === true) {
      const [transfers] = await db.query(
        `SELECT * FROM money_transfers WHERE user_id = ? ${dateFilter}`,
        [userId, ...dateParams]
      );
      reportData.transfers = transfers;
    }
    
    res.json(reportData);
  } catch (error) {
    console.error('Error generating user report:', error);
    res.status(500).json({ message: 'Failed to generate user report', error: error.message });
  }
};

// Download user report
exports.downloadUserReport = async (req, res) => {
  const userId = req.params.userId;
  const { 
    format = 'pdf',
    includeFlights = true,
    includeTickets = true,
    includePassports = true,
    includeTransfers = true,
    startDate,
    endDate
  } = req.query;
  
  try {
    // Get user info
    const [user] = await db.query(
      `SELECT id, username, email, role, created_at, last_login FROM users WHERE id = ?`,
      [userId]
    );
    
    if (!user.length) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const reportData = {
      user: user[0]
    };
    
    // Add date filter to queries if provided
    let dateFilter = '';
    const dateParams = [];
    
    if (startDate && endDate) {
      dateFilter = 'AND created_at BETWEEN ? AND ?';
      dateParams.push(startDate, endDate);
    } else if (startDate) {
      dateFilter = 'AND created_at >= ?';
      dateParams.push(startDate);
    } else if (endDate) {
      dateFilter = 'AND created_at <= ?';
      dateParams.push(endDate);
    }
    
    // Get passport data if requested
    if (includePassports === 'true' || includePassports === true) {
      const [passports] = await db.query(
        `SELECT * FROM passports WHERE user_id = ? ${dateFilter}`,
        [userId, ...dateParams]
      );
      reportData.passports = passports;
    }
    
    // Get flight data if requested
    if (includeFlights === 'true' || includeFlights === true) {
      const [flights] = await db.query(
        `SELECT f.*, a.name as airline_name 
         FROM flights f
         LEFT JOIN airlines a ON f.airline_id = a.id
         WHERE f.user_id = ? ${dateFilter}`,
        [userId, ...dateParams]
      );
      reportData.flights = flights;
    }
    
    // Get ticket data if requested
    if (includeTickets === 'true' || includeTickets === true) {
      const [tickets] = await db.query(
        `SELECT * FROM tickets WHERE user_id = ? ${dateFilter}`,
        [userId, ...dateParams]
      );
      reportData.tickets = tickets;
    }
    
    // Get transfer data if requested
    if (includeTransfers === 'true' || includeTransfers === true) {
      const [transfers] = await db.query(
        `SELECT * FROM money_transfers WHERE user_id = ? ${dateFilter}`,
        [userId, ...dateParams]
      );
      reportData.transfers = transfers;
    }
    
    // Set response headers based on format
    if (format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=user_report_${userId}.pdf`);
      await generatePDF(reportData, res);
    } else if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      await generateCSV(reportData, res);
    } else {
      res.status(400).json({ message: 'Unsupported format. Use pdf or csv.' });
    }
    
  } catch (error) {
    console.error('Error downloading user report:', error);
    res.status(500).json({ message: 'Failed to download user report', error: error.message });
  }
};