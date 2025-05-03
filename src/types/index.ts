import { Employee } from '../services/employeeService';
import { Passport } from '../services/passportService';
import { Flight } from '../services/flightService';
import { Ticket } from '../services/ticketService';
import { MoneyTransfer } from '../services/transferService';
import { Nationality } from '../services/nationalityService';
import { Airline } from '../services/airlineService';
import { VisaType } from '../services/visaTypeService';

// Re-export all types
export type {
  Employee,
  Passport,
  Flight,
  Ticket,
  MoneyTransfer,
  Nationality,
  Airline,
  VisaType
};
