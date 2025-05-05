-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  role VARCHAR(20) NOT NULL DEFAULT 'User',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL,
  
  -- Add constraints to validate role
  CONSTRAINT check_role CHECK (role IN ('Admin', 'User', 'HR', 'Travel'))
);

-- Create an initial admin user (password: admin123)
INSERT INTO users (id, username, password, email, role)
VALUES (
  'USER100001', 
  'admin', 
  '$2b$10$lZeZHvG2EO6tLYomZuBWBuGgcUul1Fm77qXsf4srrGvQ35YA.PU0G', 
  'admin@example.com', 
  'Admin'
);

-- Create a regular user (password: user123)
INSERT INTO users (id, username, password, email, role)
VALUES (
  'USER100002', 
  'user', 
  '$2b$10$R2TYLTGBo7/21AT0Np4JGeNp3.j21aJ7fFYeucW/L5tVNVlPO0HC2', 
  'user@example.com', 
  'User'
);