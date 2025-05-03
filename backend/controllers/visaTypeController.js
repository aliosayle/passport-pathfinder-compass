const VisaType = require('../models/visaType');

const visaTypeController = {
  // Get all visa types
  getAllVisaTypes: async (req, res) => {
    try {
      const visaTypes = await VisaType.getAll();
      res.status(200).json(visaTypes);
    } catch (error) {
      console.error('Error fetching visa types:', error);
      res.status(500).json({ message: 'Failed to fetch visa types', error: error.message });
    }
  },

  // Get visa type by ID
  getVisaTypeById: async (req, res) => {
    try {
      const { id } = req.params;
      const visaType = await VisaType.getById(id);
      
      if (!visaType) {
        return res.status(404).json({ message: `Visa type with ID ${id} not found` });
      }
      
      res.status(200).json(visaType);
    } catch (error) {
      console.error(`Error fetching visa type ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to fetch visa type', error: error.message });
    }
  },

  // Create new visa type
  createVisaType: async (req, res) => {
    try {
      const visaTypeData = req.body;
      
      // Basic validation
      if (!visaTypeData.id || !visaTypeData.type || !visaTypeData.country_code) {
        return res.status(400).json({ 
          message: 'Visa type ID, type name, and country code are required' 
        });
      }
      
      const newVisaType = await VisaType.create(visaTypeData);
      res.status(201).json({ 
        message: 'Visa type created successfully', 
        visaType: newVisaType 
      });
    } catch (error) {
      console.error('Error creating visa type:', error);
      res.status(500).json({ message: 'Failed to create visa type', error: error.message });
    }
  },

  // Update visa type
  updateVisaType: async (req, res) => {
    try {
      const { id } = req.params;
      const visaTypeData = req.body;
      
      // Check if visa type exists
      const existingVisaType = await VisaType.getById(id);
      if (!existingVisaType) {
        return res.status(404).json({ message: `Visa type with ID ${id} not found` });
      }
      
      const updated = await VisaType.update(id, visaTypeData);
      
      if (updated) {
        res.status(200).json({ message: 'Visa type updated successfully' });
      } else {
        res.status(400).json({ message: 'Failed to update visa type' });
      }
    } catch (error) {
      console.error(`Error updating visa type ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to update visa type', error: error.message });
    }
  },

  // Delete visa type
  deleteVisaType: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if visa type exists
      const existingVisaType = await VisaType.getById(id);
      if (!existingVisaType) {
        return res.status(404).json({ message: `Visa type with ID ${id} not found` });
      }
      
      const deleted = await VisaType.delete(id);
      
      if (deleted) {
        res.status(200).json({ message: 'Visa type deleted successfully' });
      } else {
        res.status(400).json({ message: 'Failed to delete visa type' });
      }
    } catch (error) {
      console.error(`Error deleting visa type ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to delete visa type', error: error.message });
    }
  }
};

module.exports = visaTypeController;