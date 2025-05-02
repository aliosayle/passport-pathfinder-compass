
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
