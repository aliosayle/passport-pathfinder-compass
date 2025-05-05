const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/db');
require('dotenv').config();

// Import routes
const employeeRoutes = require('./routes/employees');
const passportRoutes = require('./routes/passports');
const flightRoutes = require('./routes/flights');
const ticketRoutes = require('./routes/tickets');
const transferRoutes = require('./routes/transfers');
const nationalityRoutes = require('./routes/nationalities');
const airlineRoutes = require('./routes/airlines');
const visaTypeRoutes = require('./routes/visaTypes');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const uploadRoutes = require('./routes/uploads');
const reportRoutes = require('./routes/reports'); // Add reports routes

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection
testConnection();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/passports', passportRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/nationalities', nationalityRoutes);
app.use('/api/airlines', airlineRoutes);
app.use('/api/visa-types', visaTypeRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/reports', reportRoutes); // Register reports routes

// Serve uploaded files statically (optional, for viewing in browser)
app.use('/uploads', express.static('uploads'));

// Default route
app.get('/', (req, res) => {
  res.send('Passport Management System API is running');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Something went wrong!', error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;