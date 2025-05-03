const Airline = require('../models/airline');

const airlineController = {
  // Get all airlines
  getAllAirlines: async (req, res) => {
    try {
      const airlines = await Airline.getAll();
      res.status(200).json(airlines);
    } catch (error) {
      console.error('Error fetching airlines:', error);
      res.status(500).json({ message: 'Failed to fetch airlines', error: error.message });
    }
  },

  // Get airline by ID
  getAirlineById: async (req, res) => {
    try {
      const { id } = req.params;
      const airline = await Airline.getById(id);
      
      if (!airline) {
        return res.status(404).json({ message: `Airline with ID ${id} not found` });
      }
      
      res.status(200).json(airline);
    } catch (error) {
      console.error(`Error fetching airline ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to fetch airline', error: error.message });
    }
  },

  // Create new airline
  createAirline: async (req, res) => {
    try {
      const airlineData = req.body;
      
      // Basic validation
      if (!airlineData.id || !airlineData.name || !airlineData.code) {
        return res.status(400).json({ message: 'Airline ID, name, and code are required' });
      }
      
      const newAirline = await Airline.create(airlineData);
      res.status(201).json({ 
        message: 'Airline created successfully', 
        airline: newAirline 
      });
    } catch (error) {
      console.error('Error creating airline:', error);
      res.status(500).json({ message: 'Failed to create airline', error: error.message });
    }
  },

  // Update airline
  updateAirline: async (req, res) => {
    try {
      const { id } = req.params;
      const airlineData = req.body;
      
      // Check if airline exists
      const existingAirline = await Airline.getById(id);
      if (!existingAirline) {
        return res.status(404).json({ message: `Airline with ID ${id} not found` });
      }
      
      const updated = await Airline.update(id, airlineData);
      
      if (updated) {
        res.status(200).json({ message: 'Airline updated successfully' });
      } else {
        res.status(400).json({ message: 'Failed to update airline' });
      }
    } catch (error) {
      console.error(`Error updating airline ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to update airline', error: error.message });
    }
  },

  // Delete airline
  deleteAirline: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if airline exists
      const existingAirline = await Airline.getById(id);
      if (!existingAirline) {
        return res.status(404).json({ message: `Airline with ID ${id} not found` });
      }
      
      const deleted = await Airline.delete(id);
      
      if (deleted) {
        res.status(200).json({ message: 'Airline deleted successfully' });
      } else {
        res.status(400).json({ message: 'Failed to delete airline' });
      }
    } catch (error) {
      console.error(`Error deleting airline ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to delete airline', error: error.message });
    }
  }
};

module.exports = airlineController;