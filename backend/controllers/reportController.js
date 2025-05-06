const Report = require('../models/report');
const { generateEmployeeReportPDF } = require('../utils/pdfGenerator');
const path = require('path');
const fs = require('fs-extra');

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