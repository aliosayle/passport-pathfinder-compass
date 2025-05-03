const Passport = require('../models/passport');

const passportController = {
  // Get all passports
  getAllPassports: async (req, res) => {
    try {
      const passports = await Passport.getAll();
      res.status(200).json(passports);
    } catch (error) {
      console.error('Error fetching passports:', error);
      res.status(500).json({ message: 'Failed to fetch passports', error: error.message });
    }
  },

  // Get passport by ID
  getPassportById: async (req, res) => {
    try {
      const { id } = req.params;
      const passport = await Passport.getById(id);
      
      if (!passport) {
        return res.status(404).json({ message: `Passport with ID ${id} not found` });
      }
      
      res.status(200).json(passport);
    } catch (error) {
      console.error(`Error fetching passport ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to fetch passport', error: error.message });
    }
  },

  // Get passports expiring within X days
  getExpiringPassports: async (req, res) => {
    try {
      const { days } = req.params;
      
      // Validate days parameter
      if (!days || isNaN(days) || days <= 0) {
        return res.status(400).json({ message: 'Valid number of days is required' });
      }
      
      const passports = await Passport.getExpiringPassports(days);
      res.status(200).json(passports);
    } catch (error) {
      console.error(`Error fetching expiring passports:`, error);
      res.status(500).json({ message: 'Failed to fetch expiring passports', error: error.message });
    }
  },

  // Create new passport
  createPassport: async (req, res) => {
    try {
      const passportData = req.body;
      
      // Basic validation
      if (!passportData.id || !passportData.employee_id || !passportData.passport_number) {
        return res.status(400).json({ 
          message: 'Passport ID, employee ID, and passport number are required' 
        });
      }
      
      const newPassport = await Passport.create(passportData);
      res.status(201).json({ 
        message: 'Passport created successfully', 
        passport: newPassport 
      });
    } catch (error) {
      console.error('Error creating passport:', error);
      res.status(500).json({ message: 'Failed to create passport', error: error.message });
    }
  },

  // Update passport
  updatePassport: async (req, res) => {
    try {
      const { id } = req.params;
      const passportData = req.body;
      
      // Check if passport exists
      const existingPassport = await Passport.getById(id);
      if (!existingPassport) {
        return res.status(404).json({ message: `Passport with ID ${id} not found` });
      }
      
      const updated = await Passport.update(id, passportData);
      
      if (updated) {
        res.status(200).json({ message: 'Passport updated successfully' });
      } else {
        res.status(400).json({ message: 'Failed to update passport' });
      }
    } catch (error) {
      console.error(`Error updating passport ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to update passport', error: error.message });
    }
  },

  // Delete passport
  deletePassport: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if passport exists
      const existingPassport = await Passport.getById(id);
      if (!existingPassport) {
        return res.status(404).json({ message: `Passport with ID ${id} not found` });
      }
      
      const deleted = await Passport.delete(id);
      
      if (deleted) {
        res.status(200).json({ message: 'Passport deleted successfully' });
      } else {
        res.status(400).json({ message: 'Failed to delete passport' });
      }
    } catch (error) {
      console.error(`Error deleting passport ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to delete passport', error: error.message });
    }
  }
};

module.exports = passportController;