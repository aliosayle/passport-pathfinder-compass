-- Passport Pathfinder Compass Database Setup
-- Created on May 2, 2025

-- Drop database if it exists and create a new one
DROP DATABASE IF EXISTS passport_management;
CREATE DATABASE passport_management;

-- Use the created database
USE passport_management;

-- Create employees table
CREATE TABLE employees (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(100),
  position VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20),
  nationality VARCHAR(50),
  passport_id VARCHAR(20),
  join_date DATE,
  notes TEXT
);

-- Create passports table
CREATE TABLE passports (
  id VARCHAR(20) PRIMARY KEY,
  employee_name VARCHAR(100) NOT NULL,
  employee_id VARCHAR(10) NOT NULL,
  passport_number VARCHAR(20) NOT NULL,
  nationality VARCHAR(50) NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status ENUM('With Company', 'With Employee', 'With DGM') NOT NULL,
  ticket_reference VARCHAR(20),
  notes TEXT,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  INDEX idx_expiry (expiry_date),
  INDEX idx_status (status)
);

-- Create nationalities table
CREATE TABLE nationalities (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code CHAR(2) NOT NULL,
  visa_requirements TEXT,
  UNIQUE KEY (code)
);

-- Create airlines table
CREATE TABLE airlines (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(3) NOT NULL,
  contact_info VARCHAR(100),
  UNIQUE KEY (code)
);

-- Create visa_types table
CREATE TABLE visa_types (
  id VARCHAR(10) PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  duration VARCHAR(50) NOT NULL,
  requirements TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  country_name VARCHAR(100) NOT NULL
);

-- Create flights table
CREATE TABLE flights (
  id VARCHAR(20) PRIMARY KEY,
  employee_name VARCHAR(100) NOT NULL,
  employee_id VARCHAR(10) NOT NULL,
  departure_date DATE NOT NULL,
  return_date DATE,
  destination VARCHAR(100) NOT NULL,
  origin VARCHAR(100) NOT NULL,
  airline_id VARCHAR(10) NOT NULL,
  airline_name VARCHAR(100) NOT NULL,
  ticket_reference VARCHAR(20) NOT NULL,
  flight_number VARCHAR(20),
  status ENUM('Pending', 'Completed', 'Cancelled', 'Delayed') NOT NULL,
  type ENUM('Business', 'Vacation', 'Sick Leave', 'Family Emergency', 'Training') NOT NULL,
  notes TEXT,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (airline_id) REFERENCES airlines(id),
  INDEX idx_departure (departure_date),
  INDEX idx_status (status)
);

-- Create tickets table
CREATE TABLE tickets (
  id VARCHAR(20) PRIMARY KEY,
  reference VARCHAR(20) NOT NULL UNIQUE,
  employee_name VARCHAR(100) NOT NULL,
  employee_id VARCHAR(10) NOT NULL,
  issue_date DATE NOT NULL,
  airline_id VARCHAR(10) NOT NULL,
  airline_name VARCHAR(100) NOT NULL,
  flight_number VARCHAR(20),
  departure_date DATE NOT NULL,
  return_date DATE,
  destination VARCHAR(100) NOT NULL,
  origin VARCHAR(100) NOT NULL,
  cost DECIMAL(10,2),
  currency VARCHAR(3),
  status ENUM('Active', 'Used', 'Cancelled', 'Expired') NOT NULL,
  notes TEXT,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  FOREIGN KEY (airline_id) REFERENCES airlines(id),
  INDEX idx_reference (reference)
);

-- Create money_transfers table
CREATE TABLE money_transfers (
  id VARCHAR(20) PRIMARY KEY,
  employee_id VARCHAR(10) NOT NULL,
  employee_name VARCHAR(100) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  destination VARCHAR(100) NOT NULL,
  beneficiary_name VARCHAR(100) NOT NULL,
  beneficiary_phone VARCHAR(20) NOT NULL,
  notes TEXT,
  status ENUM('Pending', 'Completed', 'Failed') NOT NULL,
  date TIMESTAMP NOT NULL,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id),
  INDEX idx_employee (employee_id),
  INDEX idx_status (status)
);

-- Add some sample data for testing
INSERT INTO employees (id, name, department, position, email, phone, nationality, join_date)
VALUES ('EMP001', 'John Doe', 'IT', 'Developer', 'john.doe@example.com', '+123456789', 'American', '2023-01-15');

INSERT INTO nationalities (id, name, code)
VALUES ('NAT001', 'United States', 'US');

-- Add a verification query to test the setup
SELECT 'Database setup completed successfully!' AS Result;