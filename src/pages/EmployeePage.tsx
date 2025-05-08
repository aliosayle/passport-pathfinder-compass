import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { User, Ticket as TicketIcon, Plane, Calendar, Banknote, Loader2, FileUp, Globe } from "lucide-react";
import TransferForm from "@/components/transfer/TransferForm";
import TransferHistory from "@/components/transfer/TransferHistory";
import FileList from "@/components/upload/FileList";
import EmployeeUploadForm from "@/components/upload/EmployeeUploadForm";
import EmployeeVisaList from "@/components/visa/EmployeeVisaList";

// Import services
import { employeeService, Employee } from "@/services/employeeService";
import { passportService, Passport } from "@/services/passportService";
import { flightService, Flight } from "@/services/flightService";
import { ticketService, Ticket } from "@/services/ticketService";
import { useToast } from "@/hooks/use-toast";

const EmployeePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State for data
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [passport, setPassport] = useState<Passport | null>(null);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState({
    employee: true,
    passport: true,
    flights: true,
    tickets: true
  });
  const [error, setError] = useState<string | null>(null);
  const [fileRefreshTrigger, setFileRefreshTrigger] = useState<number>(0);
  
  // Fetch employee data
  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!id) return;
      
      try {
        setLoading(prev => ({ ...prev, employee: true }));
        const employeeData = await employeeService.getById(id);
        setEmployee(employeeData);
      } catch (error) {
        console.error("Error fetching employee:", error);
        setError("Failed to load employee data");
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load employee data. Please try again."
        });
      } finally {
        setLoading(prev => ({ ...prev, employee: false }));
      }
    };
    
    fetchEmployeeData();
  }, [id, toast]);
  
  // Fetch passport, flights, and tickets when employee is loaded
  useEffect(() => {
    if (!id) return;
    
    const fetchPassport = async () => {
      try {
        setLoading(prev => ({ ...prev, passport: true }));
        // Check if the employee has a passport ID
        if (employee && employee.passport_id) {
          const passportData = await passportService.getById(employee.passport_id);
          setPassport(passportData);
        } else {
          // Try to fetch passport by employee ID if passport_id is not available
          const allPassports = await passportService.getAll();
          const employeePassport = allPassports.find((p: Passport) => p.employee_id === id);
          if (employeePassport) setPassport(employeePassport);
          else setPassport(null);
        }
      } catch (error) {
        console.error("Error fetching passport:", error);
        // Don't show error toast for passport as it's optional
      } finally {
        setLoading(prev => ({ ...prev, passport: false }));
      }
    };
    
    const fetchFlights = async () => {
      try {
        setLoading(prev => ({ ...prev, flights: true }));
        const flightData = await flightService.getFlightsByEmployeeId(id);
        setFlights(flightData || []);
      } catch (error) {
        console.error("Error fetching flights:", error);
        // Don't show error toast for flights as it's optional
      } finally {
        setLoading(prev => ({ ...prev, flights: false }));
      }
    };
    
    const fetchTickets = async () => {
      try {
        setLoading(prev => ({ ...prev, tickets: true }));
        // Get all tickets and filter by employee ID (assuming the API doesn't have a direct endpoint)
        const allTickets = await ticketService.getAll();
        const employeeTickets = allTickets.filter((ticket: Ticket) => ticket.employee_id === id);
        setTickets(employeeTickets);
      } catch (error) {
        console.error("Error fetching tickets:", error);
        // Don't show error toast for tickets as it's optional
      } finally {
        setLoading(prev => ({ ...prev, tickets: false }));
      }
    };
    
    fetchPassport();
    fetchFlights();
    fetchTickets();
  }, [id, employee]);
  
  const handleFileUploaded = () => {
    // Trigger file list refresh when new file is uploaded
    setFileRefreshTrigger(prev => prev + 1);
  };
  
  if (loading.employee) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading employee data...</p>
        </div>
      </Layout>
    );
  }
  
  if (error || !employee) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <h2 className="text-2xl font-bold">Employee Not Found</h2>
          <p className="text-muted-foreground">The employee you're looking for doesn't exist or there was an error loading the data.</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </Layout>
    );
  }

  // Format date safely
  const formatDate = (dateValue: string | Date | null | undefined): string => {
    if (!dateValue) return "—";
    
    try {
      const date = typeof dateValue === 'string' ? parseISO(dateValue) : dateValue;
      return format(date, "MMMM d, yyyy");
    } catch (error) {
      console.error("Invalid date format:", dateValue, error);
      return "Invalid date";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-blue-100 text-blue-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      case "Delayed":
        return "bg-yellow-100 text-yellow-800";
      case "Active":
        return "bg-green-100 text-green-800";
      case "Used":
        return "bg-blue-100 text-blue-800";
      case "Expired":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Employee Profile</h1>
          <Button onClick={() => navigate(-1)} variant="outline">
            Back
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Employee Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">{employee.name}</h3>
                <p className="text-sm text-muted-foreground">ID: {employee.id}</p>
              </div>
              
              {employee.department && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p>{employee.department}</p>
                </div>
              )}
              
              {employee.position && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Position</p>
                  <p>{employee.position}</p>
                </div>
              )}
              
              {employee.email && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p>{employee.email}</p>
                </div>
              )}
              
              {employee.phone && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p>{employee.phone}</p>
                </div>
              )}
              
              {employee.nationality && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Nationality</p>
                  <p>{employee.nationality}</p>
                </div>
              )}
              
              {employee.join_date && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Join Date</p>
                  <p>{formatDate(employee.join_date)}</p>
                </div>
              )}
              
              {employee.notes && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm">{employee.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="col-span-1 md:col-span-2">
            <Tabs defaultValue="passport" className="w-full">
              <CardHeader className="pb-0">
                <TabsList className="grid grid-cols-6">
                  <TabsTrigger value="passport">Passport</TabsTrigger>
                  <TabsTrigger value="flights">Flights</TabsTrigger>
                  <TabsTrigger value="tickets">Tickets</TabsTrigger>
                  <TabsTrigger value="files">Files</TabsTrigger>
                  <TabsTrigger value="transfer">Send Money</TabsTrigger>
                  <TabsTrigger value="transferHistory">Transfer History</TabsTrigger>
                  <TabsTrigger value="visas">Visas</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent className="pt-6">
                <TabsContent value="passport" className="space-y-4">
                  {loading.passport ? (
                    <div className="flex flex-col items-center justify-center h-48 space-y-2">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Loading passport information...</p>
                    </div>
                  ) : passport ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Passport Number</p>
                          <p className="font-medium">{passport.passport_number}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Nationality</p>
                          <p>{passport.nationality}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Issue Date</p>
                          <p>{formatDate(passport.issue_date)}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Expiry Date</p>
                          <p>{formatDate(passport.expiry_date)}</p>
                          {new Date(passport.expiry_date) < new Date() && (
                            <Badge className="bg-red-100 text-red-800 mt-1">Expired</Badge>
                          )}
                          {new Date(passport.expiry_date) > new Date() && new Date(passport.expiry_date) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) && (
                            <Badge className="bg-yellow-100 text-yellow-800 mt-1">Expiring Soon</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Status</p>
                          <Badge>{passport.status}</Badge>
                        </div>
                        {passport.ticket_reference && (
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Ticket Reference</p>
                            <p>{passport.ticket_reference}</p>
                          </div>
                        )}
                      </div>
                      
                      {passport.notes && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Notes</p>
                          <p className="text-sm">{passport.notes}</p>
                        </div>
                      )}
                      
                      {passport.last_updated && (
                        <div className="text-sm text-muted-foreground">
                          Last updated: {formatDate(passport.last_updated)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 space-y-2">
                      <p className="text-muted-foreground">No passport information available</p>
                      <Button variant="outline" size="sm">
                        Add Passport
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="flights" className="space-y-4">
                  {loading.flights ? (
                    <div className="flex flex-col items-center justify-center h-48 space-y-2">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Loading flights information...</p>
                    </div>
                  ) : flights.length > 0 ? (
                    <div className="space-y-4">
                      <div className="rounded-md border">
                        <table className="w-full text-sm">
                          <thead className="[&_tr]:border-b">
                            <tr className="border-b">
                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Route</th>
                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Airline</th>
                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                            </tr>
                          </thead>
                          <tbody className="[&_tr:last-child]:border-0">
                            {flights.map((flight) => (
                              <tr key={flight.id} className="border-b hover:bg-muted/50">
                                <td className="p-4 align-middle">
                                  {formatDate(flight.departure_date)}
                                  {flight.return_date && (
                                    <span className="block text-xs text-muted-foreground">
                                      to {formatDate(flight.return_date)}
                                    </span>
                                  )}
                                </td>
                                <td className="p-4 align-middle">
                                  {flight.origin} → {flight.destination}
                                </td>
                                <td className="p-4 align-middle">
                                  {flight.airline_name}
                                  {flight.flight_number && (
                                    <span className="block text-xs text-muted-foreground">
                                      {flight.flight_number}
                                    </span>
                                  )}
                                </td>
                                <td className="p-4 align-middle">{flight.type}</td>
                                <td className="p-4 align-middle">
                                  <Badge className={getStatusBadgeColor(flight.status)}>
                                    {flight.status}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/flights">View All Flights</Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 space-y-2">
                      <Plane className="h-10 w-10 text-muted-foreground/50" />
                      <p className="text-muted-foreground">No flight information available</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="tickets" className="space-y-4">
                  {loading.tickets ? (
                    <div className="flex flex-col items-center justify-center h-48 space-y-2">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Loading tickets information...</p>
                    </div>
                  ) : tickets.length > 0 ? (
                    <div className="space-y-4">
                      <div className="rounded-md border">
                        <table className="w-full text-sm">
                          <thead className="[&_tr]:border-b">
                            <tr className="border-b">
                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Reference</th>
                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Route</th>
                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Airline</th>
                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                            </tr>
                          </thead>
                          <tbody className="[&_tr:last-child]:border-0">
                            {tickets.map((ticket) => (
                              <tr key={ticket.id} className="border-b hover:bg-muted/50">
                                <td className="p-4 align-middle font-medium">{ticket.reference}</td>
                                <td className="p-4 align-middle">
                                  {formatDate(ticket.departure_date)}
                                  {ticket.return_date && (
                                    <span className="block text-xs text-muted-foreground">
                                      to {formatDate(ticket.return_date)}
                                    </span>
                                  )}
                                </td>
                                <td className="p-4 align-middle">
                                  {ticket.origin} → {ticket.destination}
                                  {ticket.has_return && (
                                    <span className="block text-xs">
                                      {ticket.return_completed ? "Return completed" : "Return journey planned"}
                                    </span>
                                  )}
                                </td>
                                <td className="p-4 align-middle">
                                  {ticket.airline_name}
                                  {ticket.flight_number && (
                                    <span className="block text-xs text-muted-foreground">
                                      {ticket.flight_number}
                                    </span>
                                  )}
                                </td>
                                <td className="p-4 align-middle">
                                  <Badge className={getStatusBadgeColor(ticket.status)}>
                                    {ticket.status}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="flex justify-between">
                        <Button variant="outline" size="sm" onClick={() => {
                          // Navigate to tickets page with pre-selected filter for this employee
                          navigate(`/tickets?employee=${id}`);
                        }}>
                          View All Tickets
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {
                          // Navigate to add new ticket page with this employee pre-selected
                          navigate(`/tickets/new?employee=${id}`);
                        }}>
                          Add New Ticket
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 space-y-4">
                      <TicketIcon className="h-10 w-10 text-muted-foreground/50" />
                      <p className="text-muted-foreground">No ticket information available</p>
                      <Button variant="outline" size="sm" onClick={() => {
                        // Navigate to add new ticket page with this employee pre-selected
                        navigate(`/tickets/new?employee=${id}`);
                      }}>
                        Add First Ticket
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="files" className="space-y-4">
                  <div className="flex items-center mb-4 space-x-2">
                    <FileUp className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Employee Files</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-1">
                      <EmployeeUploadForm 
                        employeeId={id || ''} 
                        employeeName={employee?.name || 'Employee'} 
                        onUploadSuccess={handleFileUploaded}
                      />
                    </div>
                    
                    <div className="col-span-1 md:col-span-2">
                      <FileList employeeId={id} refreshTrigger={fileRefreshTrigger} compact={true} />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="transfer" className="space-y-4">
                  <div className="flex items-center mb-4 space-x-2">
                    <Banknote className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Send Money to {employee.name}</h3>
                  </div>
                  <TransferForm />
                </TabsContent>
                
                <TabsContent value="transferHistory" className="space-y-4">
                  <div className="flex items-center mb-4 space-x-2">
                    <Banknote className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Transfer History</h3>
                  </div>
                  <TransferHistory />
                </TabsContent>
                
                <TabsContent value="visas" className="space-y-4">
                  <div className="flex items-center mb-4 space-x-2">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Employee Visas</h3>
                  </div>
                  
                  <EmployeeVisaList employeeId={id} />
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default EmployeePage;
