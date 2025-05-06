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
      
      // Skip adding footers to the last page if it's blank (when content ended on previous page)
      // Count real pages with content
      let totalPages = doc.bufferedPageRange().count;
      const totalBufferedPages = totalPages;
      
      // Add footers to all pages with content
      let lastContentY = 0;
      
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        
        // Add footer to current page on the same line
        const footerX = 40;
        const footerY = doc.page.height - 30;
        
        doc.fontSize(7)
           .fillColor('#666666');
           
        // Left side of the footer
        doc.text(
          'Passport Pathfinder Compass • Confidential • ' + formatDate(reportData.generatedAt),
          footerX, 
          footerY, 
          { 
            continued: true,
            width: 300,
            align: 'left'
          }
        );
        
        // Right side of footer (page numbers) on the same line
        doc.text(
          `Page ${i + 1} of ${totalPages}`,
          { 
            align: 'right',
            width: 200
          }
        );
      }
      
      // Finalize the PDF and resolve with the file path
      doc.end();
      
      stream.on('finish', () => {
        resolve(outputPath);
      });
      
      stream.on('error', (err) => {
        reject(err);
      });
      
    } catch (error) {
      reject(error);
    }
  });
}

// Helper function to format dates for display
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
}

// Helper to calculate Y position after employee info
function getYPositionAfterEmployeeInfo(doc, employee, startY) {
  // Calculate approximate height: base height + number of fields × line height
  return startY + 120; // Adjust based on actual content
}

// Helper to calculate Y position after passport info
function getYPositionAfterPassportInfo(doc, passport, startY) {
  // Calculate approximate height: base height + number of fields × line height
  return startY + 100; // Adjust based on actual content
}

// Helper function to add header with logo (more compact)
function addHeader(doc) {
  doc.fontSize(20)
     .font('Helvetica-Bold')
     .fillColor('#003366')
     .text('PASSPORT PATHFINDER', 40, 40, { align: 'left' });
  
  doc.fontSize(14)
     .font('Helvetica')
     .fillColor('#666666')
     .text('EMPLOYEE TRAVEL REPORT', 40, 65, { align: 'left' });
  
  doc.moveTo(40, 85)
     .lineTo(doc.page.width - 40, 85)
     .lineWidth(1)
     .strokeColor('#003366')
     .stroke();
  
  doc.moveDown(0.5);
}

// Helper function to add report title with date range (more compact)
function addReportTitle(doc, reportData) {
  const startDate = formatDate(reportData.reportPeriod.startDate);
  const endDate = formatDate(reportData.reportPeriod.endDate);
  
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .fillColor('#333333')
     .text(`${reportData.employee.name} | ID: ${reportData.employee.id}`, { align: 'left' });
  
  doc.fontSize(9)
     .font('Helvetica')
     .fillColor('#666666')
     .text(`Report Period: ${startDate} to ${endDate}`, { align: 'left' });
  
  doc.moveDown(1);
}

// Compact employee information for side-by-side layout
function addEmployeeInformationCompact(doc, employee, x, width) {
  const startY = doc.y;
  
  doc.x = x;
  doc.fontSize(9)
     .font('Helvetica')
     .fillColor('#333333');
  
  // Add employee details in a compact format
  doc.text(`Department: ${employee.department || 'N/A'}`, { continued: false });
  doc.text(`Position: ${employee.position || 'N/A'}`, { continued: false });
  doc.text(`Email: ${employee.email || 'N/A'}`, { continued: false });
  doc.text(`Phone: ${employee.phone || 'N/A'}`, { continued: false });
  doc.text(`Nationality: ${employee.nationality || 'N/A'}`, { continued: false });
  doc.text(`Join Date: ${formatDate(employee.join_date)}`, { continued: false });
  
  if (employee.notes) {
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('Notes:', { continued: false });
    doc.font('Helvetica').text(employee.notes, { continued: false });
  }
  
  doc.x = x;
  return doc.y;
}

// Compact passport information for side-by-side layout
function addPassportInformationCompact(doc, passport, x, width) {
  const startY = doc.y;
  
  doc.x = x;
  doc.fontSize(9)
     .font('Helvetica')
     .fillColor('#333333');
  
  // Add passport details in a compact format
  doc.text(`Passport Number: ${passport.passport_number || 'N/A'}`, { continued: false });
  doc.text(`Nationality: ${passport.nationality || 'N/A'}`, { continued: false });
  doc.text(`Issue Date: ${formatDate(passport.issue_date)}`, { continued: false });
  doc.text(`Expiry Date: ${formatDate(passport.expiry_date)}`, { continued: false });
  doc.text(`Status: ${passport.status || 'N/A'}`, { continued: false });
  
  if (passport.notes) {
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('Notes:', { continued: false });
    doc.font('Helvetica').text(passport.notes, { continued: false });
  }
  
  doc.x = x;
  return doc.y;
}

// Add summary information in a more compact layout
function addCompactSummary(doc, summary, x, width) {
  // Draw title
  doc.x = x;
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor('#003366')
     .text('REPORT SUMMARY', { underline: false });
  
  doc.moveDown(0.5);
  
  // Create a compact summary with horizontal boxes
  const boxWidth = width / 4 - 5;
  const boxHeight = 50;
  const baseX = x;
  const baseY = doc.y;
  
  // Box 1: Total Flights
  drawSummaryBox(doc, baseX, baseY, boxWidth, boxHeight, 
    'TOTAL FLIGHTS', summary.totalFlights.toString(), '#f0f7ff');
  
  // Box 2: Total Transfers
  drawSummaryBox(doc, baseX + boxWidth + 5, baseY, boxWidth, boxHeight, 
    'TOTAL TRANSFERS', summary.totalTransfers.toString(), '#f0f7ff');
  
  // Box 3: Transfer Amount
  const amountText = summary.currencies.length === 1 ? 
    `${summary.totalTransferAmount.toFixed(2)} ${summary.currencies[0]}` : 
    summary.totalTransferAmount.toFixed(2);
  
  drawSummaryBox(doc, baseX + (boxWidth + 5) * 2, baseY, boxWidth, boxHeight, 
    'TRANSFER AMOUNT', amountText, '#f0f7ff');
  
  // Box 4: Destinations
  drawSummaryBox(doc, baseX + (boxWidth + 5) * 3, baseY, boxWidth, boxHeight, 
    'DESTINATIONS', summary.destinations.length.toString(), '#f0f7ff');
  
  doc.y = baseY + boxHeight + 10;
}

// Helper to draw a summary box
function drawSummaryBox(doc, x, y, width, height, title, value, bgColor) {
  doc.rect(x, y, width, height)
     .fillAndStroke(bgColor, '#003366');
  
  doc.fillColor('#003366')
     .fontSize(8)
     .font('Helvetica-Bold')
     .text(title, x + 5, y + 5, { width: width - 10 });
  
  doc.fontSize(value.length > 8 ? 10 : 16)
     .text(value, x + 5, y + 20, { width: width - 10 });
}

// Optimized flights section
function addOptimizedFlightsSection(doc, flights) {
  doc.x = 40; // Ensure left alignment
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .fillColor('#003366')
     .text('FLIGHTS', { align: 'left' });
  
  doc.moveDown(0.3);
  
  if (!flights || flights.length === 0) {
    doc.font('Helvetica')
       .fontSize(9)
       .fillColor('#666666')
       .text('No flight information available for this period.');
    return;
  }
  
  const flightRows = flights.map(flight => [
    flight.flight_number || 'N/A',
    formatDate(flight.departure_date),
    flight.destination,
    flight.origin,
    flight.airline_name || 'N/A',
    flight.status
  ]);
  
  const flightTable = {
    headers: ['Flight #', 'Date', 'Destination', 'Origin', 'Airline', 'Status'],
    rows: flightRows
  };
  
  createOptimizedTable(doc, flightTable);
}

// Optimized tickets section
function addOptimizedTicketsSection(doc, tickets) {
  doc.x = 40; // Ensure left alignment
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .fillColor('#003366')
     .text('TICKETS', { align: 'left' });
  
  doc.moveDown(0.3);
  
  if (!tickets || tickets.length === 0) {
    doc.font('Helvetica')
       .fontSize(9)
       .fillColor('#666666')
       .text('No ticket information available for this period.');
    return;
  }
  
  const ticketRows = tickets.map(ticket => [
    ticket.reference,
    formatDate(ticket.issue_date),
    ticket.airline_name || 'N/A',
    formatDate(ticket.departure_date),
    ticket.return_date ? formatDate(ticket.return_date) : 'N/A',
    ticket.cost ? `${ticket.cost.toFixed(2)} ${ticket.currency || ''}` : 'N/A'
  ]);
  
  const ticketTable = {
    headers: ['Reference', 'Issue Date', 'Airline', 'Departure', 'Return', 'Cost'],
    rows: ticketRows
  };
  
  createOptimizedTable(doc, ticketTable);
}

// Optimized transfers section
function addOptimizedTransfersSection(doc, transfers) {
  doc.x = 40; // Ensure left alignment
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .fillColor('#003366')
     .text('MONEY TRANSFERS', { align: 'left' });
  
  doc.moveDown(0.3);
  
  if (!transfers || transfers.length === 0) {
    doc.font('Helvetica')
       .fontSize(9)
       .fillColor('#666666')
       .text('No money transfer information available for this period.');
    return;
  }
  
  const transferRows = transfers.map(transfer => [
    formatDate(transfer.date),
    `${transfer.amount} ${transfer.currency}`,
    transfer.destination,
    transfer.beneficiary_name,
    transfer.status
  ]);
  
  const transferTable = {
    headers: ['Date', 'Amount', 'Destination', 'Beneficiary', 'Status'],
    rows: transferRows
  };
  
  createOptimizedTable(doc, transferTable);
}

// Optimized table creation with less padding and better space utilization
function createOptimizedTable(doc, table) {
  const { headers, rows } = table;
  const columnCount = headers.length;
  const rowHeight = 16; // Reduced row height
  const tableWidth = doc.page.width - 80; // Full width - left/right margins
  const columnWidth = tableWidth / columnCount;
  
  // Set starting position
  const startX = 40;
  let startY = doc.y;
  
  // Draw header row background
  doc.rect(startX, startY, tableWidth, rowHeight)
     .fillAndStroke('#003366', '#003366');
  
  // Draw header text
  doc.fillColor('#ffffff')
     .fontSize(8)
     .font('Helvetica-Bold');
  
  headers.forEach((header, i) => {
    doc.text(
      header,
      startX + (i * columnWidth) + 3,
      startY + 4,
      { width: columnWidth - 6 }
    );
  });
  
  startY += rowHeight;
  
  // Draw rows
  rows.forEach((row, rowIndex) => {
    // Check if we need to add a new page
    if (startY + rowHeight > doc.page.height - 40) {
      doc.addPage();
      startY = 40;
      
      // Redraw headers on the new page
      doc.rect(startX, startY, tableWidth, rowHeight)
         .fillAndStroke('#003366', '#003366');
      
      doc.fillColor('#ffffff')
         .fontSize(8)
         .font('Helvetica-Bold');
      
      headers.forEach((header, i) => {
        doc.text(
          header,
          startX + (i * columnWidth) + 3,
          startY + 4,
          { width: columnWidth - 6 }
        );
      });
      
      startY += rowHeight;
    }
    
    // Draw row background (alternating colors)
    doc.rect(startX, startY, tableWidth, rowHeight)
       .fillAndStroke(rowIndex % 2 === 0 ? '#f8f9fa' : '#ffffff', '#cccccc');
    
    // Draw row text
    doc.fillColor('#333333')
       .fontSize(8)
       .font('Helvetica');
    
    row.forEach((cell, i) => {
      doc.text(
        cell,
        startX + (i * columnWidth) + 3,
        startY + 4,
        { width: columnWidth - 6 }
      );
    });
    
    startY += rowHeight;
  });
  
  doc.y = startY + 5; // Less space after table
}

module.exports = { generateEmployeeReportPDF };