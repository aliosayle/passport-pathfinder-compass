const Nationality = require('../models/nationality');

const nationalityController = {
  // Get all nationalities
  getAllNationalities: async (req, res) => {
    try {
      const nationalities = await Nationality.getAll();
      res.status(200).json(nationalities);
    } catch (error) {
      console.error('Error fetching nationalities:', error);
      res.status(500).json({ message: 'Failed to fetch nationalities', error: error.message });
    }
  },

  // Get nationality by ID
  getNationalityById: async (req, res) => {
    try {
      const { id } = req.params;
      const nationality = await Nationality.getById(id);
      
      if (!nationality) {
        return res.status(404).json({ message: `Nationality with ID ${id} not found` });
      }
      
      res.status(200).json(nationality);
    } catch (error) {
      console.error(`Error fetching nationality ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to fetch nationality', error: error.message });
    }
  },

  // Create new nationality
  createNationality: async (req, res) => {
    try {
      const nationalityData = req.body;
      
      // Basic validation
      if (!nationalityData.id || !nationalityData.name || !nationalityData.code) {
        return res.status(400).json({ message: 'Nationality ID, name, and code are required' });
      }
      
      const newNationality = await Nationality.create(nationalityData);
      res.status(201).json({ 
        message: 'Nationality created successfully', 
        nationality: newNationality 
      });
    } catch (error) {
      console.error('Error creating nationality:', error);
      res.status(500).json({ message: 'Failed to create nationality', error: error.message });
    }
  },

  // Update nationality
  updateNationality: async (req, res) => {
    try {
      const { id } = req.params;
      const nationalityData = req.body;
      
      // Check if nationality exists
      const existingNationality = await Nationality.getById(id);
      if (!existingNationality) {
        return res.status(404).json({ message: `Nationality with ID ${id} not found` });
      }
      
      const updated = await Nationality.update(id, nationalityData);
      
      if (updated) {
        res.status(200).json({ message: 'Nationality updated successfully' });
      } else {
        res.status(400).json({ message: 'Failed to update nationality' });
      }
    } catch (error) {
      console.error(`Error updating nationality ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to update nationality', error: error.message });
    }
  },

  // Delete nationality
  deleteNationality: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if nationality exists
      const existingNationality = await Nationality.getById(id);
      if (!existingNationality) {
        return res.status(404).json({ message: `Nationality with ID ${id} not found` });
      }
      
      const deleted = await Nationality.delete(id);
      
      if (deleted) {
        res.status(200).json({ message: 'Nationality deleted successfully' });
      } else {
        res.status(400).json({ message: 'Failed to delete nationality' });
      }
    } catch (error) {
      console.error(`Error deleting nationality ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to delete nationality', error: error.message });
    }
  }
};

module.exports = nationalityController;