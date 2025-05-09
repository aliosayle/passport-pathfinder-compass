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
const employeeVisaRoutes = require('./routes/employeeVisas');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const uploadRoutes = require('./routes/uploads');
const reportRoutes = require('./routes/reports');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3001;

// Define allowed origins
const allowedOrigins = [
  'http://localhost:8080', // For local frontend dev
  'http://10.10.10.158:8080', // For frontend dev accessed via VPN/local network IP
  // Add any other origins you need to support (e.g., your production frontend URL)
];

// Enhanced CORS configuration for file downloads
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Range', 'Access-Control-Allow-Origin', 'Origin', 'Accept', 'Content-Disposition'],
  exposedHeaders: ['Content-Disposition', 'Content-Type', 'Content-Length', 'Content-Range', 'Accept-Ranges']
};

// Apply CORS middleware with enhanced options
app.use(cors(corsOptions));

// Additional CORS handling for preflight requests
app.options('*', cors(corsOptions));

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Add test endpoint
app.get('/', (req, res) => {
  res.send('Passport Pathfinder API is running!');
});

// Use routes
app.use('/api/employees', employeeRoutes);
app.use('/api/passports', passportRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/nationalities', nationalityRoutes);
app.use('/api/airlines', airlineRoutes);
app.use('/api/visa-types', visaTypeRoutes);
app.use('/api/employee-visas', employeeVisaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/reports', reportRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  testConnection(); // Test database connection
});