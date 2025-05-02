
# Passport and Travel Management System - Backend Guide

This document provides guidance on how to implement a backend system for the Passport and Travel Management application. It explains the core functionality and provides a database schema design for MySQL.

## Application Overview

The Passport and Travel Management System is designed to help companies manage employee passports, travel arrangements, flights, and money transfers. Key features include:

1. **Employee Management**: Track employee details including personal information and passport data
2. **Passport Management**: Monitor passport status, expiry dates, and current location
3. **Flight Tracking**: Manage employee travel including flights, tickets, and travel details
4. **Money Transfer Service**: Allow employees to send money to beneficiaries in different locations

## Current Data Structures

The frontend application uses these key data types:

### Core Entities

- **Employee**: Basic employee information
- **Passport**: Passport details and status
- **Flight**: Travel information 
- **Ticket**: Flight ticket details
- **MoneyTransfer**: Money transfer records

### Supporting Entities

- **Nationality**: Country information 
- **Airline**: Airline details
- **VisaType**: Visa requirements by country

## Database Schema Design (MySQL)

Below is the recommended database schema design:

### `employees` Table
```sql
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
```

### `passports` Table
```sql
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
```

### `nationalities` Table
```sql
CREATE TABLE nationalities (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code CHAR(2) NOT NULL,
  visa_requirements TEXT,
  UNIQUE KEY (code)
);
```

### `airlines` Table
```sql
CREATE TABLE airlines (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(3) NOT NULL,
  contact_info VARCHAR(100),
  UNIQUE KEY (code)
);
```

### `visa_types` Table
```sql
CREATE TABLE visa_types (
  id VARCHAR(10) PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  duration VARCHAR(50) NOT NULL,
  requirements TEXT NOT NULL,
  country_code CHAR(2) NOT NULL,
  country_name VARCHAR(100) NOT NULL
);
```

### `flights` Table
```sql
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
```

### `tickets` Table
```sql
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
```

### `money_transfers` Table
```sql
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
```

## API Endpoints

The backend should implement these API endpoints:

### Employees
- `GET /api/employees` - List all employees
- `GET /api/employees/:id` - Get employee details
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Passports
- `GET /api/passports` - List all passports
- `GET /api/passports/:id` - Get passport details
- `GET /api/passports/expiring/:days` - Get passports expiring in X days
- `POST /api/passports` - Create new passport
- `PUT /api/passports/:id` - Update passport
- `DELETE /api/passports/:id` - Delete passport

### Flights
- `GET /api/flights` - List all flights
- `GET /api/flights/:id` - Get flight details
- `GET /api/flights/employee/:employeeId` - Get flights for employee
- `POST /api/flights` - Create new flight
- `PUT /api/flights/:id` - Update flight
- `DELETE /api/flights/:id` - Delete flight

### Tickets
- `GET /api/tickets` - List all tickets
- `GET /api/tickets/:id` - Get ticket details
- `GET /api/tickets/reference/:reference` - Get ticket by reference
- `GET /api/tickets/employee/:employeeId` - Get tickets for employee
- `POST /api/tickets` - Create new ticket
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket

### Money Transfers
- `GET /api/transfers` - List all transfers
- `GET /api/transfers/:id` - Get transfer details
- `GET /api/transfers/employee/:employeeId` - Get transfers for employee
- `POST /api/transfers` - Create new transfer
- `PUT /api/transfers/:id` - Update transfer status
- `POST /api/transfers/:id/complete` - Mark transfer as completed

### Supporting Entities
- `GET /api/nationalities` - List all nationalities
- `GET /api/airlines` - List all airlines
- `GET /api/visa-types` - List all visa types

## Authentication and Security

1. Implement JWT-based authentication
2. Create role-based access control:
   - Admin: Full access to all data
   - HR: Access to employee and passport management
   - Travel: Access to flight and ticket management
   - Finance: Access to money transfer management

## Data Relationships

1. One employee has one passport (1:1)
2. One employee can have many flights (1:N)
3. One employee can have many tickets (1:N)
4. One employee can have many money transfers (1:N)
5. One flight is associated with one airline (N:1)
6. One ticket is associated with one flight (1:1)

## Best Practices

1. Implement proper error handling with status codes
2. Use prepared statements to prevent SQL injection
3. Add input validation on all endpoints
4. Implement logging for all operations
5. Create database indexes for frequently queried columns
6. Set up regular database backups
7. Implement rate limiting for API endpoints
8. Use environment variables for configuration

## Testing Considerations

1. Write unit tests for business logic
2. Write API tests for each endpoint
3. Test database migrations for schema changes
4. Implement CI/CD pipelines for automated testing

## Migration Strategy

When implementing the backend, follow these steps:

1. Create database schema and relationships
2. Import existing data from frontend mock data
3. Implement core API endpoints for CRUD operations
4. Add authentication and security features
5. Extend with additional business logic
6. Test thoroughly before deploying

This guide should provide a comprehensive starting point for an AI agent to build a complete backend system for the Passport and Travel Management application.
