const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middlewares/auth');

// Placeholder for money transfer routes
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Money transfer routes are ready to be implemented' });
});

module.exports = router;