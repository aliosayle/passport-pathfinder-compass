const PDFDocument = require('pdfkit');
const fs = require('fs-extra');
const path = require('path');

/**
 * Generate a professional PDF report for an employee
 * @param {Object} reportData - The full report data object
 * @param {string} outputPath - The path where the PDF should be saved
 * @returns {Promise<string>} - The path to the generated PDF file
 */
async function generateEmployeeReportPDF(reportData, outputPath) {
  return new Promise((resolve, reject) => {
    try {
      // Configure the document with proper settings
      const doc = new PDFDocument({
        margin: 40, // More compact margins
        size: 'A4',
        bufferPages: true,
        autoFirstPage: true,
        info: {
          Title: `Employee Report - ${reportData.employee.name}`,
          Author: 'Passport Pathfinder Compass',
          Subject: 'Employee Travel Report',
          Keywords: 'employee, report, travel, passport, visa',
          CreationDate: new Date()
        }
      });

      // Pipe the PDF into the output file
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);
      
      // Add content to the document
      addHeader(doc);

      // Create a structured layout to optimize space
      const contentMarginLeft = 40;
      const contentWidth = doc.page.width - (contentMarginLeft * 2);
      
      // Add report title in a compact way
      addReportTitle(doc, reportData);
      
      // Top section with basic employee and passport info (2-column layout)
      const topSectionY = doc.y;
      
      // Add employee info (left column)
      doc.text('EMPLOYEE INFORMATION', contentMarginLeft, topSectionY, { continued: false });
      doc.moveDown(0.5);
      addEmployeeInformationCompact(doc, reportData.employee, contentMarginLeft, contentWidth / 2 - 10);
      
      // Add passport info (right column)
      if (reportData.passport) {
        doc.fontSize(14)
          .font('Helvetica-Bold')
          .fillColor('#003366')
          .text('PASSPORT INFORMATION', contentMarginLeft + contentWidth / 2, topSectionY, { continued: false });
          
        doc.moveDown(0.5);
        addPassportInformationCompact(doc, reportData.passport, contentMarginLeft + contentWidth / 2, contentWidth / 2 - 10);
      }
      
      // Return to full width and continue with report
      doc.x = contentMarginLeft;
      doc.y = Math.max(
        getYPositionAfterEmployeeInfo(doc, reportData.employee, topSectionY),
        reportData.passport ? getYPositionAfterPassportInfo(doc, reportData.passport, topSectionY) : 0
      ) + 20;
      
      // Add summary section with improved layout
      addCompactSummary(doc, reportData.summary, contentMarginLeft, contentWidth);
      
      // Add the details sections with optimized layout
      
      // Flights section (high importance - most compact layout)
      doc.moveDown(1);
      addOptimizedFlightsSection(doc, reportData.flights);
      
      // Calculate if we need a new page for tickets - more accurate calculation
      const spaceNeededForTicketsHeader = 
        doc.y + 60 > doc.page.height - 60 && reportData.tickets && reportData.tickets.length > 0;
      
      if (spaceNeededForTicketsHeader) {
        doc.addPage();
      } else {
        doc.moveDown(1);
      }
      
      // Tickets section
      if (reportData.tickets && reportData.tickets.length > 0) {
        addOptimizedTicketsSection(doc, reportData.tickets);
      }
      
      // Calculate if we need a new page for transfers - more accurate calculation
      const spaceNeededForTransfersHeader = 
        doc.y + 60 > doc.page.height - 60 && reportData.transfers && reportData.transfers.length > 0;
      
      if (spaceNeededForTransfersHeader) {
        doc.addPage();
      } else {
        doc.moveDown(1);
      }
      
      // Money transfers section
      if (reportData.transfers && reportData.transfers.length > 0) {
        addOptimizedTransfersSection(doc, reportData.transfers);
      }
      
     