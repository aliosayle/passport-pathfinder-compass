
import { Passport } from '@/types';

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
