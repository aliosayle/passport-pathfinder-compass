import { Passport, Nationality, Airline, VisaType, Flight, Ticket, FlightStatus, FlightType, Employee } from '@/types';

// Helper to calculate days between dates
export const daysBetweenDates = (date1: Date, date2: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
  const diffDays = Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
  return diffDays;
};

// Get status color based on expiry date
export const getExpiryStatusColor = (expiryDate: Date): string => {
  const today = new Date();
  const daysToExpiry = daysBetweenDates(today, expiryDate);
  
  if (expiryDate < today) return 'passport-red'; // Expired
  if (daysToExpiry <= 30) return 'passport-red'; // Expiring very soon
  if (daysToExpiry <= 90) return 'passport-amber'; // Expiring soon
  return 'passport-green'; // Valid for a while
};

// Get standard passport statuses
export const standardStatuses: string[] = ['With Company', 'With Employee', 'With DGM'];

// Flight statuses
export const flightStatuses: FlightStatus[] = ['Pending', 'Completed', 'Cancelled', 'Delayed'];

// Flight types
export const flightTypes: FlightType[] = ['Business', 'Vacation', 'Sick Leave', 'Family Emergency', 'Training'];

// Ticket statuses
export const ticketStatuses: string[] = ['Active', 'Used', 'Cancelled', 'Expired'];

// Example data
export const mockPassports: Passport[] = [
  {
    id: '1',
    employeeName: 'John Smith',
    employeeId: 'EMP001',
    passportNumber: 'A1234567',
    nationality: 'United Kingdom',
    issueDate: new Date(2019, 5, 15),
    expiryDate: new Date(2029, 5, 15),
    status: 'With Employee',
    ticketReference: 'T12345',
    notes: 'Regular business traveler',
    lastUpdated: new Date(2023, 11, 10),
  },
  {
    id: '2',
    employeeName: 'Sarah Johnson',
    employeeId: 'EMP002',
    passportNumber: 'B9876543',
    nationality: 'United States',
    issueDate: new Date(2018, 2, 10),
    expiryDate: new Date(2023, 6, 15),
    status: 'With Company',
    ticketReference: 'T54321',
    lastUpdated: new Date(2023, 10, 22),
  },
  {
    id: '3',
    employeeName: 'Ahmed Hassan',
    employeeId: 'EMP003',
    passportNumber: 'C5432198',
    nationality: 'Egypt',
    issueDate: new Date(2020, 8, 5),
    expiryDate: new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    status: 'With DGM',
    ticketReference: 'T98765',
    notes: 'Needs renewal soon',
    lastUpdated: new Date(2023, 11, 28),
  },
  {
    id: '4',
    employeeName: 'Li Wei',
    employeeId: 'EMP004',
    passportNumber: 'D1122334',
    nationality: 'China',
    issueDate: new Date(2017, 11, 12),
    expiryDate: new Date(new Date().getTime() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    status: 'With Company',
    ticketReference: 'T13579',
    lastUpdated: new Date(2023, 9, 15),
  },
  {
    id: '5',
    employeeName: 'Maria Garcia',
    employeeId: 'EMP005',
    passportNumber: 'E9988776',
    nationality: 'Spain',
    issueDate: new Date(2021, 3, 25),
    expiryDate: new Date(2031, 3, 25),
    status: 'With Employee',
    lastUpdated: new Date(2023, 11, 30),
  },
];

// Mock nationalities
export const mockNationalities: Nationality[] = [
  {
    id: '1',
    name: 'United States',
    code: 'US',
    visaRequirements: 'Visa required for stays over 90 days'
  },
  {
    id: '2',
    name: 'United Kingdom',
    code: 'GB',
    visaRequirements: 'Visa required for work purposes'
  },
  {
    id: '3',
    name: 'Canada',
    code: 'CA',
    visaRequirements: 'Visa required for stays over 6 months'
  },
  {
    id: '4',
    name: 'Germany',
    code: 'DE',
    visaRequirements: 'Schengen visa for non-EU citizens'
  },
  {
    id: '5',
    name: 'Egypt',
    code: 'EG',
    visaRequirements: 'Visa required for all purposes'
  }
];

// Mock airlines
export const mockAirlines: Airline[] = [
  {
    id: '1',
    name: 'Emirates',
    code: 'EK',
    contactInfo: 'customer.support@emirates.com'
  },
  {
    id: '2',
    name: 'Qatar Airways',
    code: 'QR',
    contactInfo: 'info@qatarairways.com'
  },
  {
    id: '3',
    name: 'British Airways',
    code: 'BA',
    contactInfo: 'customer.service@ba.com'
  },
  {
    id: '4',
    name: 'Lufthansa',
    code: 'LH',
    contactInfo: 'support@lufthansa.com'
  },
  {
    id: '5',
    name: 'Air France',
    code: 'AF',
    contactInfo: 'contact@airfrance.fr'
  }
];

// Mock visa types
export const mockVisaTypes: VisaType[] = [
  {
    id: '1',
    type: 'Tourist',
    duration: '90 days',
    requirements: 'Passport, application form, photo',
    countryCode: 'US',
    countryName: 'United States'
  },
  {
    id: '2',
    type: 'Business',
    duration: '180 days',
    requirements: 'Passport, invitation letter, company documents',
    countryCode: 'GB',
    countryName: 'United Kingdom'
  },
  {
    id: '3',
    type: 'Work',
    duration: '1 year',
    requirements: 'Passport, work permit, medical certificate',
    countryCode: 'DE',
    countryName: 'Germany'
  },
  {
    id: '4',
    type: 'Student',
    duration: '2 years',
    requirements: 'Passport, acceptance letter, financial statements',
    countryCode: 'CA',
    countryName: 'Canada'
  },
  {
    id: '5',
    type: 'Transit',
    duration: '3 days',
    requirements: 'Passport, onward ticket',
    countryCode: 'FR',
    countryName: 'France'
  }
];

// Mock flights
export const mockFlights: Flight[] = [
  {
    id: '1',
    employeeName: 'John Smith',
    employeeId: 'EMP001',
    departureDate: new Date(2023, 11, 15),
    returnDate: new Date(2023, 11, 30),
    destination: 'London',
    origin: 'Dubai',
    airlineId: '3',
    airlineName: 'British Airways',
    ticketReference: 'T12345',
    flightNumber: 'BA106',
    status: 'Completed',
    type: 'Business',
    notes: 'Annual conference',
    lastUpdated: new Date(2023, 10, 10)
  },
  {
    id: '2',
    employeeName: 'Sarah Johnson',
    employeeId: 'EMP002',
    departureDate: new Date(2024, 1, 10),
    returnDate: new Date(2024, 1, 20),
    destination: 'Paris',
    origin: 'Dubai',
    airlineId: '5',
    airlineName: 'Air France',
    ticketReference: 'T54321',
    flightNumber: 'AF655',
    status: 'Pending',
    type: 'Training',
    lastUpdated: new Date(2023, 12, 5)
  },
  {
    id: '3',
    employeeName: 'Ahmed Hassan',
    employeeId: 'EMP003',
    departureDate: new Date(2024, 2, 15),
    destination: 'Cairo',
    origin: 'Dubai',
    airlineId: '1',
    airlineName: 'Emirates',
    ticketReference: 'T98765',
    flightNumber: 'EK927',
    status: 'Pending',
    type: 'Family Emergency',
    notes: 'Emergency leave',
    lastUpdated: new Date(2024, 1, 28)
  },
  {
    id: '4',
    employeeName: 'Li Wei',
    employeeId: 'EMP004',
    departureDate: new Date(2023, 9, 5),
    returnDate: new Date(2023, 9, 25),
    destination: 'Berlin',
    origin: 'Dubai',
    airlineId: '4',
    airlineName: 'Lufthansa',
    ticketReference: 'T13579',
    flightNumber: 'LH761',
    status: 'Completed',
    type: 'Vacation',
    lastUpdated: new Date(2023, 8, 15)
  },
  {
    id: '5',
    employeeName: 'Maria Garcia',
    employeeId: 'EMP005',
    departureDate: new Date(2024, 3, 10),
    returnDate: new Date(2024, 3, 15),
    destination: 'Madrid',
    origin: 'Dubai',
    airlineId: '2',
    airlineName: 'Qatar Airways',
    ticketReference: 'T24680',
    flightNumber: 'QR151',
    status: 'Pending',
    type: 'Sick Leave',
    notes: 'Medical treatment',
    lastUpdated: new Date(2024, 2, 20)
  }
];

// Mock tickets
export const mockTickets: Ticket[] = [
  {
    id: '1',
    reference: 'T12345',
    employeeName: 'John Smith',
    employeeId: 'EMP001',
    issueDate: new Date(2023, 10, 1),
    airlineId: '3',
    airlineName: 'British Airways',
    flightNumber: 'BA106',
    departureDate: new Date(2023, 11, 15),
    returnDate: new Date(2023, 11, 30),
    destination: 'London',
    origin: 'Dubai',
    cost: 1500,
    currency: 'USD',
    status: 'Used',
    notes: 'Business class',
    lastUpdated: new Date(2023, 10, 10)
  },
  {
    id: '2',
    reference: 'T54321',
    employeeName: 'Sarah Johnson',
    employeeId: 'EMP002',
    issueDate: new Date(2023, 12, 1),
    airlineId: '5',
    airlineName: 'Air France',
    flightNumber: 'AF655',
    departureDate: new Date(2024, 1, 10),
    returnDate: new Date(2024, 1, 20),
    destination: 'Paris',
    origin: 'Dubai',
    cost: 1200,
    currency: 'EUR',
    status: 'Active',
    lastUpdated: new Date(2023, 12, 5)
  },
  {
    id: '3',
    reference: 'T98765',
    employeeName: 'Ahmed Hassan',
    employeeId: 'EMP003',
    issueDate: new Date(2024, 1, 25),
    airlineId: '1',
    airlineName: 'Emirates',
    flightNumber: 'EK927',
    departureDate: new Date(2024, 2, 15),
    destination: 'Cairo',
    origin: 'Dubai',
    cost: 800,
    currency: 'USD',
    status: 'Active',
    notes: 'One-way ticket',
    lastUpdated: new Date(2024, 1, 28)
  },
  {
    id: '4',
    reference: 'T13579',
    employeeName: 'Li Wei',
    employeeId: 'EMP004',
    issueDate: new Date(2023, 8, 15),
    airlineId: '4',
    airlineName: 'Lufthansa',
    flightNumber: 'LH761',
    departureDate: new Date(2023, 9, 5),
    returnDate: new Date(2023, 9, 25),
    destination: 'Berlin',
    origin: 'Dubai',
    cost: 1350,
    currency: 'EUR',
    status: 'Used',
    lastUpdated: new Date(2023, 8, 15)
  },
  {
    id: '5',
    reference: 'T24680',
    employeeName: 'Maria Garcia',
    employeeId: 'EMP005',
    issueDate: new Date(2024, 2, 20),
    airlineId: '2',
    airlineName: 'Qatar Airways',
    flightNumber: 'QR151',
    departureDate: new Date(2024, 3, 10),
    returnDate: new Date(2024, 3, 15),
    destination: 'Madrid',
    origin: 'Dubai',
    cost: 950,
    currency: 'USD',
    status: 'Active',
    lastUpdated: new Date(2024, 2, 20)
  }
];

// Mock employees
export const mockEmployees: Employee[] = [
  {
    id: 'EMP001',
    name: 'John Smith',
    department: 'Marketing',
    position: 'Senior Marketing Manager',
    email: 'john.smith@example.com',
    phone: '+971-55-123-4567',
    nationality: 'United Kingdom',
    passportId: '1',
    joinDate: new Date(2019, 1, 15),
    notes: 'Key account manager for European clients'
  },
  {
    id: 'EMP002',
    name: 'Sarah Johnson',
    department: 'Finance',
    position: 'Financial Analyst',
    email: 'sarah.johnson@example.com',
    phone: '+971-55-987-6543',
    nationality: 'United States',
    passportId: '2',
    joinDate: new Date(2020, 3, 10)
  },
  {
    id: 'EMP003',
    name: 'Ahmed Hassan',
    department: 'Operations',
    position: 'Operations Manager',
    email: 'ahmed.hassan@example.com',
    phone: '+971-55-456-7890',
    nationality: 'Egypt',
    passportId: '3',
    joinDate: new Date(2018, 5, 22),
    notes: 'Responsible for MENA region operations'
  },
  {
    id: 'EMP004',
    name: 'Li Wei',
    department: 'IT',
    position: 'System Architect',
    email: 'li.wei@example.com',
    phone: '+971-55-321-6540',
    nationality: 'China',
    passportId: '4',
    joinDate: new Date(2021, 8, 5)
  },
  {
    id: 'EMP005',
    name: 'Maria Garcia',
    department: 'HR',
    position: 'HR Director',
    email: 'maria.garcia@example.com',
    phone: '+971-55-654-3210',
    nationality: 'Spain',
    passportId: '5',
    joinDate: new Date(2017, 11, 12),
    notes: 'Leads the talent acquisition team'
  }
];

// Custom hook to manage passport data
export let passports = [...mockPassports];

// Function to add a new passport
export const addPassport = (passport: Omit<Passport, 'id' | 'lastUpdated'>): Passport => {
  const newPassport: Passport = {
    ...passport,
    id: (passports.length + 1).toString(),
    lastUpdated: new Date(),
  };
  
  passports = [...passports, newPassport];
  return newPassport;
};

// Function to update a passport
export const updatePassport = (updatedPassport: Passport): Passport => {
  const index = passports.findIndex(p => p.id === updatedPassport.id);
  
  if (index !== -1) {
    const updated = {
      ...updatedPassport,
      lastUpdated: new Date(),
    };
    passports[index] = updated;
    return updated;
  }
  
  throw new Error('Passport not found');
};

// Get passports expiring within days
export const getExpiringPassports = (days: number): Passport[] => {
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + days);
  
  return passports.filter(passport => 
    passport.expiryDate >= today && 
    passport.expiryDate <= futureDate
  ).sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime());
};

// Get all passports sorted by expiry date
export const getAllPassportsSortedByExpiry = (): Passport[] => {
  return [...passports].sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime());
};

// Get summary stats
export const getPassportStats = () => {
  const totalCount = passports.length;
  const expiringIn30Days = getExpiringPassports(30).length;
  const expiringIn90Days = getExpiringPassports(90).length;
  const withCompany = passports.filter(p => p.status === 'With Company').length;
  const withEmployee = passports.filter(p => p.status === 'With Employee').length;
  const withDGM = passports.filter(p => p.status === 'With DGM').length;
  
  return {
    totalCount,
    expiringIn30Days,
    expiringIn90Days,
    withCompany,
    withEmployee,
    withDGM
  };
};

// DATA MANAGEMENT FOR NEW ENTITIES

// Nationalities
export let nationalities = [...mockNationalities];

export const addNationality = (nationality: Omit<Nationality, 'id'>): Nationality => {
  const newNationality: Nationality = {
    ...nationality,
    id: (nationalities.length + 1).toString(),
  };
  
  nationalities = [...nationalities, newNationality];
  return newNationality;
};

export const updateNationality = (updatedNationality: Nationality): Nationality => {
  const index = nationalities.findIndex(n => n.id === updatedNationality.id);
  
  if (index !== -1) {
    nationalities[index] = updatedNationality;
    return updatedNationality;
  }
  
  throw new Error('Nationality not found');
};

// Airlines
export let airlines = [...mockAirlines];

export const addAirline = (airline: Omit<Airline, 'id'>): Airline => {
  const newAirline: Airline = {
    ...airline,
    id: (airlines.length + 1).toString(),
  };
  
  airlines = [...airlines, newAirline];
  return newAirline;
};

export const updateAirline = (updatedAirline: Airline): Airline => {
  const index = airlines.findIndex(a => a.id === updatedAirline.id);
  
  if (index !== -1) {
    airlines[index] = updatedAirline;
    return updatedAirline;
  }
  
  throw new Error('Airline not found');
};

// Visa Types
export let visaTypes = [...mockVisaTypes];

export const addVisaType = (visaType: Omit<VisaType, 'id'>): VisaType => {
  const newVisaType: VisaType = {
    ...visaType,
    id: (visaTypes.length + 1).toString(),
  };
  
  visaTypes = [...visaTypes, newVisaType];
  return newVisaType;
};

export const updateVisaType = (updatedVisaType: VisaType): VisaType => {
  const index = visaTypes.findIndex(v => v.id === updatedVisaType.id);
  
  if (index !== -1) {
    visaTypes[index] = updatedVisaType;
    return updatedVisaType;
  }
  
  throw new Error('Visa type not found');
};

// Flights
export let flights = [...mockFlights];

export const addFlight = (flight: Omit<Flight, 'id' | 'lastUpdated'>): Flight => {
  const newFlight: Flight = {
    ...flight,
    id: (flights.length + 1).toString(),
    lastUpdated: new Date(),
  };
  
  flights = [...flights, newFlight];
  return newFlight;
};

export const updateFlight = (updatedFlight: Flight): Flight => {
  const index = flights.findIndex(f => f.id === updatedFlight.id);
  
  if (index !== -1) {
    const updated = {
      ...updatedFlight,
      lastUpdated: new Date(),
    };
    flights[index] = updated;
    return updated;
  }
  
  throw new Error('Flight not found');
};

export const getFlightsByStatus = (status: FlightStatus): Flight[] => {
  return flights.filter(f => f.status === status);
};

export const getFlightsByType = (type: FlightType): Flight[] => {
  return flights.filter(f => f.type === type);
};

// Tickets
export let tickets = [...mockTickets];

export const addTicket = (ticket: Omit<Ticket, 'id' | 'lastUpdated'>): Ticket => {
  const newTicket: Ticket = {
    ...ticket,
    id: (tickets.length + 1).toString(),
    lastUpdated: new Date(),
  };
  
  tickets = [...tickets, newTicket];
  return newTicket;
};

export const updateTicket = (updatedTicket: Ticket): Ticket => {
  const index = tickets.findIndex(t => t.id === updatedTicket.id);
  
  if (index !== -1) {
    const updated = {
      ...updatedTicket,
      lastUpdated: new Date(),
    };
    tickets[index] = updated;
    return updated;
  }
  
  throw new Error('Ticket not found');
};

export const getActiveTickets = (): Ticket[] => {
  return tickets.filter(t => t.status === 'Active');
};

// Employees
export let employees = [...mockEmployees];

export const addEmployee = (employee: Omit<Employee, 'id'>): Employee => {
  const newEmployee: Employee = {
    ...employee,
    id: `EMP${(employees.length + 1).toString().padStart(3, '0')}`,
  };
  
  employees = [...employees, newEmployee];
  return newEmployee;
};

export const updateEmployee = (updatedEmployee: Employee): Employee => {
  const index = employees.findIndex(e => e.id === updatedEmployee.id);
  
  if (index !== -1) {
    employees[index] = updatedEmployee;
    return updatedEmployee;
  }
  
  throw new Error('Employee not found');
};

export const getEmployeeById = (id: string): Employee | undefined => {
  return employees.find(employee => employee.id === id);
};

export const getEmployeeByName = (name: string): Employee | undefined => {
  return employees.find(employee => employee.name === name);
};

export const getAllEmployees = (): Employee[] => {
  return [...employees];
};

export const getEmployeePassport = (employeeId: string): Passport | undefined => {
  return passports.find(passport => passport.employeeId === employeeId);
};

export const getEmployeeFlights = (employeeId: string): Flight[] => {
  return flights.filter(flight => flight.employeeId === employeeId);
};

export const getEmployeeTickets = (employeeId: string): Ticket[] => {
  return tickets.filter(ticket => ticket.employeeId === employeeId);
};

export const getEmployeeIdByName = (name: string): string => {
  const employee = employees.find(e => e.name === name);
  return employee ? employee.id : '';
};
