const EmployeeVisa = require('../models/employeeVisa');

// Get all employee visas
exports.getAllVisas = async (req, res) => {
  try {
    const visas = await EmployeeVisa.getAll();
    res.json(visas);
  } catch (error) {
    console.error('Error getting employee visas:', error);
    res.status(500).json({ message: 'Error retrieving employee visas', error: error.message });
  }
};

// Get a single employee visa by ID
exports.getVisaById = async (req, res) => {
  try {
    const visa = await EmployeeVisa.getById(req.params.id);
    if (!visa) {
      return res.status(404).json({ message: 'Employee visa not found' });
    }
    res.json(visa);
  } catch (error) {
    console.error('Error getting employee visa:', error);
    res.status(500).json({ message: 'Error retrieving employee visa', error: error.message });
  }
};

// Get visas by employee ID
exports.getVisasByEmployeeId = async (req, res) => {
  try {
    const visas = await EmployeeVisa.getByEmployeeId(req.params.employeeId);
    res.json(visas);
  } catch (error) {
    console.error('Error getting employee visas:', error);
    res.status(500).json({ message: 'Error retrieving employee visas', error: error.message });
  }
};

// Create a new employee visa
exports.createVisa = async (req, res) => {
  try {
    const newVisa = await EmployeeVisa.create(req.body);
    res.status(201).json(newVisa);
  } catch (error) {
    console.error('Error creating employee visa:', error);
    res.status(500).json({ message: 'Error creating employee visa', error: error.message });
  }
};

// Update an employee visa
exports.updateVisa = async (req, res) => {
  try {
    const updatedVisa = await EmployeeVisa.update(req.params.id, req.body);
    if (!updatedVisa) {
      return res.status(404).json({ message: 'Employee visa not found' });
    }
    res.json(updatedVisa);
  } catch (error) {
    console.error('Error updating employee visa:', error);
    res.status(500).json({ message: 'Error updating employee visa', error: error.message });
  }
};

// Delete an employee visa
exports.deleteVisa = async (req, res) => {
  try {
    const success = await EmployeeVisa.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ message: 'Employee visa not found' });
    }
    res.json({ message: 'Employee visa deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee visa:', error);
    res.status(500).json({ message: 'Error deleting employee visa', error: error.message });
  }
};

// Get visas that are expiring soon
exports.getExpiringVisas = async (req, res) => {
  try {
    // Get days threshold from query params or default to 30 days
    const daysThreshold = req.query.days ? parseInt(req.query.days, 10) : 30;
    const expiringVisas = await EmployeeVisa.getExpiringVisas(daysThreshold);
    res.json(expiringVisas);
  } catch (error) {
    console.error('Error getting expiring visas:', error);
    res.status(500).json({ message: 'Error retrieving expiring visas', error: error.message });
  }
};