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

      // Add footer with page numbers
      addFooterWithPageNumbers(doc);

      // Finalize the PDF and end the stream
      doc.end();

      stream.on('finish', () => {
        resolve(outputPath);
      });

      stream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Add a professional header to the document
 */
function addHeader(doc) {
  doc.fontSize(20)
     .font('Helvetica-Bold')
     .fillColor('#003366')
     .text('PASSPORT PATHFINDER COMPASS', { align: 'center' })
     .fontSize(16)
     .fillColor('#333')
     .text('EMPLOYEE TRAVEL REPORT', { align: 'center' })
     .moveDown(1);
}

/**
 * Add the report title section
 */
function addReportTitle(doc, reportData) {
  const startDate = new Date(reportData.reportPeriod.startDate).toLocaleDateString();
  const endDate = new Date(reportData.reportPeriod.endDate).toLocaleDateString();
  
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .fillColor('#003366')
     .text(`${reportData.employee.name} - Travel Report`, { align: 'center' })
     .fontSize(10)
     .font('Helvetica')
     .fillColor('#666')
     .text(`Report Period: ${startDate} to ${endDate}`, { align: 'center' })
     .moveDown(2);
}

/**
 * Add compact employee information
 */
function addEmployeeInformationCompact(doc, employee, x, width) {
  const originalX = doc.x;
  const originalY = doc.y;
  
  doc.font('Helvetica')
     .fontSize(10)
     .fillColor('#333')
     .text(`ID: ${employee.id}`, x, doc.y)
     .moveDown(0.25)
     .text(`Department: ${employee.department || 'N/A'}`, x, doc.y)
     .moveDown(0.25)
     .text(`Position: ${employee.position || 'N/A'}`, x, doc.y)
     .moveDown(0.25)
     .text(`Join Date: ${employee.join_date ? new Date(employee.join_date).toLocaleDateString() : 'N/A'}`, x, doc.y);
  
  return doc.y;
}

/**
 * Add passport information in compact format
 */
function addPassportInformationCompact(doc, passport, x, width) {
  const originalY = doc.y;
  
  doc.font('Helvetica')
     .fontSize(10)
     .fillColor('#333')
     .text(`Number: ${passport.passport_number}`, x, doc.y)
     .moveDown(0.25)
     .text(`Nationality: ${passport.nationality}`, x, doc.y)
     .moveDown(0.25)
     .text(`Issue Date: ${passport.issue_date ? new Date(passport.issue_date).toLocaleDateString() : 'N/A'}`, x, doc.y)
     .moveDown(0.25)
     .text(`Expiry Date: ${passport.expiry_date ? new Date(passport.expiry_date).toLocaleDateString() : 'N/A'}`, x, doc.y)
     .moveDown(0.25)
     .text(`Status: ${passport.status}`, x, doc.y);
  
  return doc.y;
}

/**
 * Get Y position after adding employee info
 */
function getYPositionAfterEmployeeInfo(doc, employee, startY) {
  // Calculate approximate height based on content
  return startY + 10 * 6; // Number of lines * line height
}

/**
 * Get Y position after adding passport info
 */
function getYPositionAfterPassportInfo(doc, passport, startY) {
  // Calculate approximate height based on content
  return startY + 10 * 7; // Number of lines * line height
}

/**
 * Add compact summary section
 */
function addCompactSummary(doc, summary, x, width) {
  doc.fontSize(14)
    .font('Helvetica-Bold')
    .fillColor('#003366')
    .text('REPORT SUMMARY', { underline: true })
    .moveDown(0.5);
  
  // Create a grid-style summary
  const summaryData = [
    { label: 'Total Flights:', value: summary.totalFlights },
    { label: 'Total Transfers:', value: summary.totalTransfers },
    { label: 'Transfer Amount:', value: `${summary.totalTransferAmount} ${summary.currencies.join(', ')}` },
    { label: 'Destinations:', value: summary.destinations.join(', ') },
    { label: 'Period:', value: `${new Date(summary.period.startDate).toLocaleDateString()} to ${new Date(summary.period.endDate).toLocaleDateString()}` }
  ];
  
  summaryData.forEach(item => {
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#333')
       .text(`${item.label}`, { continued: true, width: 100 })
       .font('Helvetica')
       .text(` ${item.value}`)
       .moveDown(0.25);
  });
}

/**
 * Add optimized flights section
 */
function addOptimizedFlightsSection(doc, flights) {
  if (!flights || flights.length === 0) {
    return;
  }
  
  doc.fontSize(14)
    .font('Helvetica-Bold')
    .fillColor('#003366')
    .text('FLIGHTS', { underline: true })
    .moveDown(0.5);
  
  // Create table headers
  const startX = doc.x;
  const colWidths = [80, 80, 150, 80, 80];
  
  doc.fontSize(9)
    .font('Helvetica-Bold')
    .fillColor('#333');
  
  doc.text('Date', startX, doc.y, { width: colWidths[0] });
  doc.text('Flight No.', startX + colWidths[0], doc.y, { width: colWidths[1] });
  doc.text('Route', startX + colWidths[0] + colWidths[1], doc.y, { width: colWidths[2] });
  doc.text('Airline', startX + colWidths[0] + colWidths[1] + colWidths[2], doc.y, { width: colWidths[3] });
  doc.text('Status', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], doc.y, { width: colWidths[4] });
  
  // Draw a line under the headers
  doc.moveDown(0.25);
  doc.strokeColor('#999')
     .lineWidth(0.5)
     .moveTo(startX, doc.y)
     .lineTo(startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], doc.y)
     .stroke();
  doc.moveDown(0.25);
  
  // Add rows
  doc.font('Helvetica').fontSize(9);
  
  flights.forEach((flight, index) => {
    // Add a new page if this row would go over the page boundary
    if (doc.y > doc.page.height - 60) {
      doc.addPage();
    }
    
    const departureDate = flight.departure_date ? new Date(flight.departure_date).toLocaleDateString() : 'N/A';
    
    doc.fillColor('#333')
       .text(departureDate, startX, doc.y, { width: colWidths[0] });
       
    doc.text(flight.flight_number || 'N/A', startX + colWidths[0], doc.y, { width: colWidths[1] });
    
    const route = `${flight.origin} → ${flight.destination}`;
    doc.text(route, startX + colWidths[0] + colWidths[1], doc.y, { width: colWidths[2] });
    
    doc.text(flight.airline_name || 'N/A', startX + colWidths[0] + colWidths[1] + colWidths[2], doc.y, { width: colWidths[3] });
    
    doc.text(flight.status || 'N/A', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], doc.y, { width: colWidths[4] });
    
    // Add light line between rows
    if (index < flights.length - 1) {
      doc.moveDown(0.25);
      doc.strokeColor('#eee')
         .lineWidth(0.5)
         .moveTo(startX, doc.y)
         .lineTo(startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], doc.y)
         .stroke();
      doc.moveDown(0.25);
    } else {
      doc.moveDown(0.5);
    }
  });
}

/**
 * Add optimized tickets section
 */
function addOptimizedTicketsSection(doc, tickets) {
  doc.fontSize(14)
    .font('Helvetica-Bold')
    .fillColor('#003366')
    .text('TICKETS', { underline: true })
    .moveDown(0.5);
  
  // Create table headers
  const startX = doc.x;
  const colWidths = [80, 80, 150, 80, 80];
  
  doc.fontSize(9)
    .font('Helvetica-Bold')
    .fillColor('#333');
  
  doc.text('Reference', startX, doc.y, { width: colWidths[0] });
  doc.text('Issue Date', startX + colWidths[0], doc.y, { width: colWidths[1] });
  doc.text('Details', startX + colWidths[0] + colWidths[1], doc.y, { width: colWidths[2] });
  doc.text('Airline', startX + colWidths[0] + colWidths[1] + colWidths[2], doc.y, { width: colWidths[3] });
  doc.text('Cost', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], doc.y, { width: colWidths[4] });
  
  // Draw a line under the headers
  doc.moveDown(0.25);
  doc.strokeColor('#999')
     .lineWidth(0.5)
     .moveTo(startX, doc.y)
     .lineTo(startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], doc.y)
     .stroke();
  doc.moveDown(0.25);
  
  // Add rows
  doc.font('Helvetica').fontSize(9);
  
  tickets.forEach((ticket, index) => {
    // Add a new page if this row would go over the page boundary
    if (doc.y > doc.page.height - 60) {
      doc.addPage();
    }
    
    doc.fillColor('#333')
       .text(ticket.reference, startX, doc.y, { width: colWidths[0] });
       
    const issueDate = ticket.issue_date ? new Date(ticket.issue_date).toLocaleDateString() : 'N/A';
    doc.text(issueDate, startX + colWidths[0], doc.y, { width: colWidths[1] });
    
    const details = `${ticket.origin} → ${ticket.destination}\n${new Date(ticket.departure_date).toLocaleDateString()}`;
    doc.text(details, startX + colWidths[0] + colWidths[1], doc.y, { width: colWidths[2] });
    
    doc.text(ticket.airline_name || 'N/A', startX + colWidths[0] + colWidths[1] + colWidths[2], doc.y, { width: colWidths[3] });
    
    const costDisplay = ticket.cost ? `${ticket.cost} ${ticket.currency || 'USD'}` : 'N/A';
    doc.text(costDisplay, startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], doc.y, { width: colWidths[4] });
    
    // Add light line between rows
    if (index < tickets.length - 1) {
      doc.moveDown(0.5);
      doc.strokeColor('#eee')
         .lineWidth(0.5)
         .moveTo(startX, doc.y)
         .lineTo(startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], doc.y)
         .stroke();
      doc.moveDown(0.25);
    } else {
      doc.moveDown(0.5);
    }
  });
}

/**
 * Add optimized money transfers section
 */
function addOptimizedTransfersSection(doc, transfers) {
  doc.fontSize(14)
    .font('Helvetica-Bold')
    .fillColor('#003366')
    .text('MONEY TRANSFERS', { underline: true })
    .moveDown(0.5);
  
  // Create table headers
  const startX = doc.x;
  const colWidths = [80, 90, 120, 100, 80];
  
  doc.fontSize(9)
    .font('Helvetica-Bold')
    .fillColor('#333');
  
  doc.text('Date', startX, doc.y, { width: colWidths[0] });
  doc.text('Amount', startX + colWidths[0], doc.y, { width: colWidths[1] });
  doc.text('Beneficiary', startX + colWidths[0] + colWidths[1], doc.y, { width: colWidths[2] });
  doc.text('Destination', startX + colWidths[0] + colWidths[1] + colWidths[2], doc.y, { width: colWidths[3] });
  doc.text('Status', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], doc.y, { width: colWidths[4] });
  
  // Draw a line under the headers
  doc.moveDown(0.25);
  doc.strokeColor('#999')
     .lineWidth(0.5)
     .moveTo(startX, doc.y)
     .lineTo(startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], doc.y)
     .stroke();
  doc.moveDown(0.25);
  
  // Add rows
  doc.font('Helvetica').fontSize(9);
  
  transfers.forEach((transfer, index) => {
    // Add a new page if this row would go over the page boundary
    if (doc.y > doc.page.height - 60) {
      doc.addPage();
    }
    
    const transferDate = transfer.date ? new Date(transfer.date).toLocaleDateString() : 'N/A';
    doc.fillColor('#333')
       .text(transferDate, startX, doc.y, { width: colWidths[0] });
       
    const amount = `${transfer.amount} ${transfer.currency}`;
    doc.text(amount, startX + colWidths[0], doc.y, { width: colWidths[1] });
    
    doc.text(transfer.beneficiary_name || 'N/A', startX + colWidths[0] + colWidths[1], doc.y, { width: colWidths[2] });
    
    doc.text(transfer.destination || 'N/A', startX + colWidths[0] + colWidths[1] + colWidths[2], doc.y, { width: colWidths[3] });
    
    doc.text(transfer.status || 'Completed', startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], doc.y, { width: colWidths[4] });
    
    // Add light line between rows
    if (index < transfers.length - 1) {
      doc.moveDown(0.25);
      doc.strokeColor('#eee')
         .lineWidth(0.5)
         .moveTo(startX, doc.y)
         .lineTo(startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], doc.y)
         .stroke();
      doc.moveDown(0.25);
    } else {
      doc.moveDown(0.5);
    }
  });
}

/**
 * Add footer with page numbers to all pages
 */
function addFooterWithPageNumbers(doc) {
  const totalPages = doc.bufferedPageRange().count;
  
  for (let i = 0; i < totalPages; i++) {
    doc.switchToPage(i);
    
    const footerY = doc.page.height - 30;
    const textWidth = doc.widthOfString('Passport Pathfinder Compass - Employee Report');
    const textX = (doc.page.width - textWidth) / 2;
    
    doc.fontSize(8)
       .fillColor('#666')
       .text(
         'Passport Pathfinder Compass - Employee Report',
         textX,
         footerY
       );
    
    const pageNumberWidth = doc.widthOfString(`Page ${i + 1} of ${totalPages}`);
    const pageNumberX = (doc.page.width - pageNumberWidth) / 2;
    
    doc.text(
      `Page ${i + 1} of ${totalPages}`,
      pageNumberX,
      footerY + 12
    );
  }
}

module.exports = {
  generateEmployeeReportPDF
};

