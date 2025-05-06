const { pool } = require('../config/db');

// Helper function to format dates for MySQL
const formatDateForMySQL = (date) => {
  if (!date) return null;
  
  // Handle Date objects
  if (date instanceof Date) {
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }
  
  // Handle ISO string dates
  if (typeof date === 'string' && date.includes('T')) {
    return date.slice(0, 19).replace('T', ' ');
  }
  
  return date;
};

const Report = {
  // Generate complete employee report with summary
  generateEmployeeReport: async (employeeId, startDate, endDate) => {
    try {
      // First get all the raw data
      const reportData = await Report.getEmployeeReport(employeeId, startDate, endDate);
      
      // Then generate the summary
      const summary = Report.generateReportSummary(reportData);
      
      // Return the complete report with summary
      return {
        ...reportData,
        summary
      };
    } catch (error) {
      throw error;
    }
  },

  // Get complete employee report with all related data within a date range
  getEmployeeReport: async (employeeId, startDate, endDate) => {
    const formattedStartDate = formatDateForMySQL(startDate);
    const formattedEndDate = formatDateForMySQL(endDate);
    
    try {
      // Get employee basic information
      const [employee] = await pool.query('SELECT * FROM employees WHERE id = ?', [employeeId]);
      
      if (!employee || employee.length === 0) {
        throw new Error(`Employee with ID ${employeeId} not found`);
      }
      
      // Get passport information
      const [passport] = await pool.query('SELECT * FROM passports WHERE employee_id = ?', [employeeId]);
      
      // Get flights within date range
      const [flights] = await pool.query(
        'SELECT * FROM flights WHERE employee_id = ? AND departure_date BETWEEN ? AND ? ORDER BY departure_date',
        [employeeId, formattedStartDate, formattedEndDate]
      );
      
      // Get tickets within date range
      const [tickets] = await pool.query(
        'SELECT * FROM tickets WHERE employee_id = ? AND issue_date BETWEEN ? AND ? ORDER BY issue_date',
        [employeeId, formattedStartDate, formattedEndDate]
      );
      
      // Get money transfers within date range
      const [transfers] = await pool.query(
        'SELECT * FROM money_transfers WHERE employee_id = ? AND date BETWEEN ? AND ? ORDER BY date',
        [employeeId, formattedStartDate, formattedEndDate]
      );
      
      // Get visa information from flights (assuming visa info might be stored or linked with flights)
      const [visas] = await pool.query(
        'SELECT DISTINCT destination, type FROM flights WHERE employee_id = ? AND departure_date BETWEEN ? AND ?',
        [employeeId, formattedStartDate, formattedEndDate]
      );
      
      return {
        reportPeriod: {
          startDate: formattedStartDate,
          endDate: formattedEndDate
        },
        employee: employee[0],
        passport: passport[0] || null,
        flights,
        tickets,
        transfers,
        visaDestinations: visas,
        generatedAt: new Date()
      };
    } catch (error) {
      throw error;
    }
  },
  
  // Generate summary statistics for report
  generateReportSummary: (reportData) => {
    if (!reportData) return null;
    
    // Calculate total number of flights
    const totalFlights = reportData.flights.length;
    
    // Calculate total money transfers
    const totalTransfers = reportData.transfers.length;
    let totalTransferAmount = 0;
    let currencies = new Set();
    
    reportData.transfers.forEach(transfer => {
      totalTransferAmount += Number(transfer.amount);
      currencies.add(transfer.currency);
    });
    
    // Get unique destinations
    const destinations = new Set(reportData.flights.map(flight => flight.destination));
    
    return {
      totalFlights,
      totalTransfers,
      totalTransferAmount,
      currencies: Array.from(currencies),
      destinations: Array.from(destinations),
      period: {
        startDate: reportData.reportPeriod.startDate,
        endDate: reportData.reportPeriod.endDate
      }
    };
  }
};

module.exports = Report;