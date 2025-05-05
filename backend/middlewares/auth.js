const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'passport_pathfinder_secure_jwt_secret_2025';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  // Check for token in Authorization header
  const authHeader = req.headers['authorization'];
  // Check for token in query parameters (for file downloads/views)
  const queryToken = req.query.token;
  
  // Use token from header or query parameter
  const token = (authHeader && authHeader.split(' ')[1]) || queryToken;
  
  if (token == null) return res.status(401).json({ message: 'Authentication token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Role-based access control
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Access denied: User role not defined' });
    }
    
    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }
  };
};

module.exports = {
  authenticateToken,
  authorizeRole
};