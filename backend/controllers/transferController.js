// filepath: c:\Users\User\projects\passport-pathfinder-compass\backend\controllers\transferController.js
const MoneyTransfer = require('../models/moneyTransfer');
const { v4: uuidv4 } = require('uuid');

// Controller for money transfer operations
exports.createTransfer = async (req, res) => {
  try {
    // Generate UUID if not provided
    if (!req.body.id) {
      req.body.id = uuidv4();
    }

    // Set current date if not provided
    if (!req.body.date) {
      req.body.date = new Date().toISOString();
    }
    
    // Set last_updated to current date
    req.body.last_updated = new Date().toISOString();

    // Create transfer record in database
    const transferId = await MoneyTransfer.create(req.body);
    const transfer = await MoneyTransfer.findById(req.body.id);
    
    res.status(201).json(transfer);
  } catch (error) {
    console.error('Error creating transfer:', error);
    res.status(500).json({ 
      message: 'Failed to create money transfer',
      error: error.message 
    });
  }
};

// Get all transfers
exports.getAllTransfers = async (req, res) => {
  try {
    const transfers = await MoneyTransfer.findAll();
    res.status(200).json(transfers);
  } catch (error) {
    console.error('Error fetching transfers:', error);
    res.status(500).json({ 
      message: 'Failed to fetch transfers',
      error: error.message 
    });
  }
};

// Get transfer by ID
exports.getTransferById = async (req, res) => {
  try {
    const transfer = await MoneyTransfer.findById(req.params.id);
    
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }
    
    res.status(200).json(transfer);
  } catch (error) {
    console.error('Error fetching transfer:', error);
    res.status(500).json({ 
      message: 'Failed to fetch transfer details',
      error: error.message 
    });
  }
};

// Get transfers by employee ID
exports.getTransfersByEmployeeId = async (req, res) => {
  try {
    const transfers = await MoneyTransfer.findByEmployeeId(req.params.employeeId);
    
    res.status(200).json(transfers);
  } catch (error) {
    console.error('Error fetching employee transfers:', error);
    res.status(500).json({ 
      message: 'Failed to fetch employee transfers',
      error: error.message 
    });
  }
};

// Update transfer status
exports.updateTransferStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['Pending', 'Completed', 'Failed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const transfer = await MoneyTransfer.findById(id);
    
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }
    
    const updatedData = { 
      status, 
      last_updated: new Date().toISOString() 
    };
    
    await MoneyTransfer.update(id, updatedData);
    const updatedTransfer = await MoneyTransfer.findById(id);
    
    res.status(200).json(updatedTransfer);
  } catch (error) {
    console.error('Error updating transfer status:', error);
    res.status(500).json({ 
      message: 'Failed to update transfer status',
      error: error.message 
    });
  }
};

// Mark transfer as completed
exports.completeTransfer = async (req, res) => {
  try {
    const { id } = req.params;
    
    const transfer = await MoneyTransfer.findById(id);
    
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }
    
    const updatedData = { 
      status: 'Completed', 
      last_updated: new Date().toISOString() 
    };
    
    await MoneyTransfer.update(id, updatedData);
    const updatedTransfer = await MoneyTransfer.findById(id);
    
    res.status(200).json(updatedTransfer);
  } catch (error) {
    console.error('Error completing transfer:', error);
    res.status(500).json({ 
      message: 'Failed to complete transfer',
      error: error.message 
    });
  }
};