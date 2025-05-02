
export type PassportStatus = 'With Company' | 'With Employee' | 'With DGM' | string;

export type Passport = {
  id: string;
  employeeName: string;
  employeeId: string;
  passportNumber: string;
  nationality: string;
  issueDate: Date;
  expiryDate: Date;
  status: PassportStatus;
  ticketReference?: string;
  notes?: string;
  lastUpdated: Date;
};

export type Nationality = {
  id: string;
  name: string;
  code: string;
  visaRequirements?: string;
};

export type Airline = {
  id: string;
  name: string;
  code: string;
  contactInfo?: string;
};

export type VisaType = {
  id: string;
  type: string;
  duration: string;
  requirements: string;
  countryCode: string;
  countryName: string;
};

export type FlightStatus = 'Pending' | 'Completed' | 'Cancelled' | 'Delayed';
export type FlightType = 'Business' | 'Vacation' | 'Sick Leave' | 'Family Emergency' | 'Training' | string;

export type Flight = {
  id: string;
  employeeName: string;
  employeeId: string;
  departureDate: Date;
  returnDate?: Date;
  destination: string;
  origin: string;
  airlineId: string;
  airlineName: string;
  ticketReference: string;
  flightNumber?: string;
  status: FlightStatus;
  type: FlightType;
  notes?: string;
  lastUpdated: Date;
};

export type Ticket = {
  id: string;
  reference: string;
  employeeName: string;
  employeeId: string;
  issueDate: Date;
  airlineId: string;
  airlineName: string;
  flightNumber?: string;
  departureDate: Date;
  returnDate?: Date;
  destination: string;
  origin: string;
  cost?: number;
  currency?: string;
  status: 'Active' | 'Used' | 'Cancelled' | 'Expired';
  notes?: string;
  lastUpdated: Date;
};
