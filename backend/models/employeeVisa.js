const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/db');

class EmployeeVisa {
  static async getAll() {
    try {
      const [rows] = await pool.execute(
        `SELECT ev.*, vt.type, vt.country_name, e.name as employee_name 
         FROM employee_visas ev
         JOIN visa_types vt ON ev.visa_type_id = vt.id
         JOIN employees e ON ev.employee_id = e.id
         ORDER BY ev.expiry_date ASC`
      );
      return rows;
    } catch (error) {
      console.error("Error getting employee visas:", error);
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT ev.*, vt.type, vt.country_name, e.name as employee_name
         FROM employee_visas ev
         JOIN visa_types vt ON ev.visa_type_id = vt.id
         JOIN employees e ON ev.employee_id = e.id
         WHERE ev.id = ?`,
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error(`Error getting employee visa with ID ${id}:`, error);
      throw error;
    }
  }

  static async getByEmployeeId(employeeId) {
    try {
      const [rows] = await pool.execute(
        `SELECT ev.*, vt.type, vt.country_name, e.name as employee_name
         FROM employee_visas ev
         JOIN visa_types vt ON ev.visa_type_id = vt.id
         JOIN employees e ON ev.employee_id = e.id
         WHERE ev.employee_id = ?
         ORDER BY ev.expiry_date ASC`,
        [employeeId]
      );
      return rows;
    } catch (error) {
      console.error(`Error getting visas for employee ${employeeId}:`, error);
      throw error;
    }
  }

  static async create(visaData) {
    try {
      // Get employee name
      const [employeeRows] = await pool.execute(
        'SELECT name FROM employees WHERE id = ?',
        [visaData.employee_id]
      );
      
      if (!employeeRows.length) {
        throw new Error('Employee not found');
      }

      // Get visa type details to calculate expiry date based on duration
      const [visaTypeRows] = await pool.execute(
        'SELECT * FROM visa_types WHERE id = ?',
        [visaData.visa_type_id]
      );
      
      if (!visaTypeRows.length) {
        throw new Error('Visa type not found');
      }

      const visaType = visaTypeRows[0];
      const visaId = uuidv4();
      
      // Calculate expiry date based on visa type duration if not provided
      let expiryDate = visaData.expiry_date || null;
      
      if (!expiryDate && visaData.issue_date) {
        // Parse issue date
        const issueDate = new Date(visaData.issue_date);
        
        // Extract duration from visa type - assuming it's stored as a number of days
        let daysToAdd = 0;
        
        // If duration is a string with text (like "30 days")
        if (typeof visaType.duration === 'string') {
          const durationStr = visaType.duration.toLowerCase();
          
          // First try to parse as a number directly (if stored as just "30")
          const parsedDays = parseInt(visaType.duration);
          if (!isNaN(parsedDays)) {
            daysToAdd = parsedDays;
            console.log(`Parsed duration as direct number of days: ${daysToAdd}`);
          }
          // If that didn't work, try parsing with regex
          else if (durationStr.includes('day')) {
            const days = parseInt(durationStr.match(/\d+/)?.[0] || '0');
            daysToAdd = days;
          } else if (durationStr.includes('month')) {
            const months = parseInt(durationStr.match(/\d+/)?.[0] || '0');
            daysToAdd = months * 30;
          } else if (durationStr.includes('year')) {
            const years = parseInt(durationStr.match(/\d+/)?.[0] || '0');
            daysToAdd = years * 365;
          }
        }
        // If duration is already a number
        else if (typeof visaType.duration === 'number') {
          daysToAdd = visaType.duration;
        }
        
        console.log(`Using duration: ${visaType.duration}, calculated days to add: ${daysToAdd}`);
        
        // Calculate expiry date
        if (daysToAdd > 0) {
          const expiryDateObj = new Date(issueDate);
          expiryDateObj.setDate(expiryDateObj.getDate() + daysToAdd);
          expiryDate = expiryDateObj.toISOString().split('T')[0]; // Format as YYYY-MM-DD
          console.log(`Calculated expiry date: ${expiryDate} based on duration: ${visaType.duration}`);
        }
      }
      
      // Ensure all values are defined or explicitly null to avoid SQL undefined errors
      const params = [
        visaId,
        visaData.visa_type_id || null,
        visaData.employee_id || null,
        employeeRows[0].name || null,
        visaData.issue_date || null,
        expiryDate, // Use calculated expiry date
        visaData.status || 'Valid',
        visaData.document_number === undefined ? null : visaData.document_number,
        visaData.notes === undefined ? null : visaData.notes
      ];
      
      // Log the parameters for debugging
      console.log("Creating visa with parameters:", JSON.stringify(params));
      
      // Validate that expiry_date is not null before executing the query
      if (!params[5]) {
        throw new Error(`Expiry date could not be calculated. Issue date: ${visaData.issue_date}, Visa type duration: ${visaType.duration}`);
      }
      
      await pool.execute(
        `INSERT INTO employee_visas (
          id, visa_type_id, employee_id, employee_name,
          issue_date, expiry_date, status, document_number, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        params
      );

      return this.getById(visaId);
    } catch (error) {
      console.error("Error creating employee visa:", error);
      throw error;
    }
  }

  static async update(id, visaData) {
    try {
      // Get current visa data
      const [currentVisa] = await pool.execute(
        'SELECT * FROM employee_visas WHERE id = ?',
        [id]
      );
      
      if (!currentVisa.length) {
        throw new Error('Visa not found');
      }

      // If employee ID has changed, get the new employee name
      let employeeName = currentVisa[0].employee_name;
      if (visaData.employee_id && visaData.employee_id !== currentVisa[0].employee_id) {
        const [employeeRows] = await pool.execute(
          'SELECT name FROM employees WHERE id = ?',
          [visaData.employee_id]
        );
        
        if (!employeeRows.length) {
          throw new Error('Employee not found');
        }
        
        employeeName = employeeRows[0].name;
      }

      // Build update query dynamically
      const updates = [];
      const params = [];

      if (visaData.visa_type_id) {
        updates.push('visa_type_id = ?');
        params.push(visaData.visa_type_id);
      }
      
      if (visaData.employee_id) {
        updates.push('employee_id = ?');
        params.push(visaData.employee_id);
        updates.push('employee_name = ?');
        params.push(employeeName);
      }
      
      if (visaData.issue_date) {
        updates.push('issue_date = ?');
        params.push(visaData.issue_date);
      }
      
      if (visaData.expiry_date) {
        updates.push('expiry_date = ?');
        params.push(visaData.expiry_date);
      }
      
      if (visaData.status) {
        updates.push('status = ?');
        params.push(visaData.status);
      }
      
      if ('document_number' in visaData) {
        updates.push('document_number = ?');
        params.push(visaData.document_number);
      }
      
      if ('notes' in visaData) {
        updates.push('notes = ?');
        params.push(visaData.notes);
      }

      // Add ID to params
      params.push(id);

      // Execute update if there are any changes
      if (updates.length > 0) {
        await pool.execute(
          `UPDATE employee_visas SET ${updates.join(', ')} WHERE id = ?`,
          params
        );
      }

      return this.getById(id);
    } catch (error) {
      console.error(`Error updating employee visa with ID ${id}:`, error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM employee_visas WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error deleting employee visa with ID ${id}:`, error);
      throw error;
    }
  }

  static async getExpiringVisas(daysThreshold = 30) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const threshold = new Date();
      threshold.setDate(threshold.getDate() + daysThreshold);
      const thresholdDate = threshold.toISOString().split('T')[0];
      
      const [rows] = await pool.execute(
        `SELECT ev.*, vt.type, vt.country_name, e.name as employee_name
         FROM employee_visas ev
         JOIN visa_types vt ON ev.visa_type_id = vt.id
         JOIN employees e ON ev.employee_id = e.id
         WHERE ev.expiry_date BETWEEN ? AND ?
         AND ev.status = 'Valid'
         ORDER BY ev.expiry_date ASC`,
        [today, thresholdDate]
      );
      
      return rows;
    } catch (error) {
      console.error(`Error getting expiring visas (${daysThreshold} days):`, error);
      throw error;
    }
  }
}

module.exports = EmployeeVisa;