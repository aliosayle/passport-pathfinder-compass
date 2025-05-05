const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken } = require('../middlewares/auth');

// All routes require authentication
router.use(authenticateToken);

// Get user report data
router.get('/users/:userId', reportController.getUserReport);

// Download user report (PDF or CSV)
router.get('/users/:userId/download', reportController.downloadUserReport);

module.exports = router;