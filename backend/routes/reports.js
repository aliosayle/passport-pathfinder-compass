const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken } = require('../middlewares/auth');

// Apply authentication middleware to all report routes
router.use(authenticateToken);

// Generate employee report
router.post('/employee', reportController.generateEmployeeReport);

// Download employee report (supports both PDF and JSON formats)
router.post('/employee/download', reportController.downloadEmployeeReport);

// Also allow GET requests for downloads (for direct browser downloads with query params)
router.get('/employee/download', reportController.downloadEmployeeReport);

// Money transfers report endpoints
router.post('/transfers', reportController.generateTransfersReport);
router.get('/transfers/download', reportController.downloadTransfersReport);
router.post('/transfers/download', reportController.downloadTransfersReport);

module.exports = router;