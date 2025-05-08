const Report = require('../models/report');
const { generateEmployeeReportPDF } = require('../utils/pdfGenerator');
const path = require('path');
const fs = require('fs-extra');
const XLSX = require('xlsx');
const { pool } = require('../config/db');

// Make sure the reports directory exists
const reportsDir = path.join(__dirname, '..', 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Generate employee report
exports.generateEmployeeReport = async (req, res) => {
  try {
    const { employeeId, startDate, endDate } = req.body;

    if (!employeeId || !startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee ID, start date, and end date are required.' 
      });
    }

    const report = await Report.generateEmployeeReport(employeeId, startDate, endDate);

    res.status(200).json({
      success: true,
      message: 'Employee report generated successfully',
      report
    });
    
  } catch (error) {
    console.error('Error generating employee report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate employee report', 
      error: error.message 
    });
  }
};

// Download employee report (now with PDF support and supporting both GET and POST)
exports.downloadEmployeeReport = async (req, res) => {
  try {
    // Get parameters from either body (POST) or query (GET)
    const employeeId = req.body.employeeId || req.query.employeeId;
    const startDate = req.body.startDate || req.query.startDate;
    const endDate = req.body.endDate || req.query.endDate;
    const format = (req.body.format || req.query.format || 'pdf').toLowerCase();

    if (!employeeId || !startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Employee ID, start date, and end date are required.' 
      });
    }

    const report = await Report.generateEmployeeReport(employeeId, startDate, endDate);

    // Generate a filename based on the employee ID and date
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    
    if (format === 'json') {
      // Legacy JSON format support
      const filename = `employee_${employeeId}_report_${timestamp}.json`;
      const filePath = path.join(reportsDir, filename);
      
      await fs.writeJson(filePath, report, { spaces: 2 });
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      
      return res.download(filePath, filename, (err) => {
        if (err) {
          console.error('Error sending file:', err);
        }
        
        // Delete the file after sending
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting temporary file:', err);
        });
      });
    } else {
      // Default to PDF format
      const filename = `employee_${employeeId}_report_${timestamp}.pdf`;
      const filePath = path.join(reportsDir, filename);
      
      // Generate the PDF file
      await generateEmployeeReportPDF(report, filePath);
      
      // Send the PDF file
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      
      return res.download(filePath, filename, (err) => {
        if (err) {
          console.error('Error sending file:', err);
        }
        
        // Delete the file after sending
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting temporary file:', err);
        });
      });
    }
    
  } catch (error) {
    console.error('Error downloading employee report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to download employee report', 
      error: error.message 
    });
  }
};

// Generate money transfers report
exports.generateTransfersReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Start date and end date are required.' 
      });
    }

    const transfers = await getTransfersReport(startDate, endDate);

    res.status(200).json({
      success: true,
      message: 'Transfers report generated successfully',
      report: transfers
    });
    
  } catch (error) {
    console.error('Error generating transfers report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate transfers report', 
      error: error.message 
    });
  }
};

// Download money transfers report
exports.downloadTransfersReport = async (req, res) => {
  try {
    // Get parameters from either body (POST) or query (GET)
    const startDate = req.body.startDate || req.query.startDate;
    const endDate = req.body.endDate || req.query.endDate;
    const format = (req.body.format || req.query.format || 'excel').toLowerCase();

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Start date and end date are required.' 
      });
    }

    const transfers = await getTransfersReport(startDate, endDate);

    // Generate a filename based on the date range
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    
    if (format === 'json') {
      // JSON format
      const filename = `transfers_report_${timestamp}.json`;
      const filePath = path.join(reportsDir, filename);
      
      await fs.writeJson(filePath, transfers, { spaces: 2 });
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      
      return res.download(filePath, filename, (err) => {
        if (err) {
          console.error('Error sending file:', err);
        }
        
        // Delete the file after sending
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting temporary file:', err);
        });
      });
    } else {
      // Default to Excel format
      const filename = `transfers_report_${timestamp}.xlsx`;
      const filePath = path.join(reportsDir, filename);
      
      // Create the Excel file
      await generateTransfersExcel(transfers, filePath);
      
      // Send the Excel file
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      
      return res.download(filePath, filename, (err) => {
        if (err) {
          console.error('Error sending file:', err);
        }
        
        // Delete the file after sending
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting temporary file:', err);
        });
      });
    }
    
  } catch (error) {
    console.error('Error downloading transfers report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to download transfers report', 
      error: error.message 
    });
  }
};

// Helper function to get all money transfers within a date range, with employee details
async function getTransfersReport(startDate, endDate) {
  try {
    // Format dates for MySQL
    const formattedStartDate = startDate instanceof Date ? 
      startDate.toISOString().slice(0, 19).replace('T', ' ') : 
      startDate;
    
    const formattedEndDate = endDate instanceof Date ? 
      endDate.toISOString().slice(0, 19).replace('T', ' ') : 
      endDate;
    
    // Query to get transfers with employee details
    const [rows] = await pool.query(
      `SELECT mt.*, e.name as employee_name, e.join_date 
       FROM money_transfers mt 
       JOIN employees e ON mt.employee_id = e.id 
       WHERE mt.date BETWEEN ? AND ? 
       ORDER BY mt.date DESC`,
      [formattedStartDate, formattedEndDate]
    );
    
    return {
      reportPeriod: {
        startDate: formattedStartDate,
        endDate: formattedEndDate
      },
      transfers: rows,
      generatedAt: new Date()
    };
  } catch (error) {
    throw error;
  }
}

// Function to generate Excel file for transfers
async function generateTransfersExcel(reportData, outputPath) {
  try {
    // Prepare data for Excel
    const excelData = reportData.transfers.map(transfer => ({
      'Date': new Date(transfer.date).toLocaleDateString(),
      'Employee ID': transfer.employee_id,
      'Employee Name': transfer.employee_name,
      'Date Joined': transfer.join_date ? new Date(transfer.join_date).toLocaleDateString() : 'N/A',
      'Amount': transfer.amount,
      'Currency': transfer.currency,
      'Beneficiary Name': transfer.beneficiary_name,
      'Beneficiary Phone': transfer.beneficiary_phone,
      'Destination': transfer.destination,
      'Status': transfer.status || 'Completed',
      'Notes': transfer.notes || ''
    }));
    
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Set column widths for better readability
    const columnWidths = [
      { wch: 12 },  // Date
      { wch: 12 },  // Employee ID
      { wch: 20 },  // Employee Name
      { wch: 12 },  // Date Joined
      { wch: 10 },  // Amount
      { wch: 8 },   // Currency
      { wch: 20 },  // Beneficiary Name
      { wch: 15 },  // Beneficiary Phone
      { wch: 15 },  // Destination
      { wch: 10 },  // Status
      { wch: 30 },  // Notes
    ];
    
    worksheet['!cols'] = columnWidths;
    
    // Add header with report info
    const header = [
      ['Money Transfers Report'],
      ['Period:', `${new Date(reportData.reportPeriod.startDate).toLocaleDateString()} to ${new Date(reportData.reportPeriod.endDate).toLocaleDateString()}`],
      ['Generated:', new Date(reportData.generatedAt).toLocaleString()],
      [''],  // Empty row before data
    ];
    
    // Add header to the beginning of the worksheet
    XLSX.utils.sheet_add_aoa(worksheet, header, { origin: 'A1' });
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transfers');
    
    // Write to file
    XLSX.writeFile(workbook, outputPath);
    
    return outputPath;
  } catch (error) {
    throw error;
  }
}