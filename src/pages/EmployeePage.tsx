
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { getEmployeeById, getEmployeePassport, getEmployeeFlights, getEmployeeTickets } from "@/lib/data";
import { User, Ticket as TicketIcon, Plane, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EmployeePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const employee = getEmployeeById(id || "");
  const passport = getEmployeePassport(id || "");
  const flights = getEmployeeFlights(id || "");
  const tickets = getEmployeeTickets(id || "");
  
  if (!employee) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <h2 className="text-2xl font-bold">Employee Not Found</h2>
          <p className="text-muted-foreground">The employee you're looking for doesn't exist.</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </Layout>
    );
  }

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
              
              {employee.joinDate && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Join Date</p>
                  <p>{format(employee.joinDate, "MMMM d, yyyy")}</p>
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
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="passport">Passport</TabsTrigger>
                  <TabsTrigger value="flights">Flights</TabsTrigger>
                  <TabsTrigger value="tickets">Tickets</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent className="pt-6">
                <TabsContent value="passport" className="space-y-4">
                  {passport ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Passport Number</p>
                          <p className="font-medium">{passport.passportNumber}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Nationality</p>
                          <p>{passport.nationality}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Issue Date</p>
                          <p>{format(passport.issueDate, "MMMM d, yyyy")}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Expiry Date</p>
                          <p>{format(passport.expiryDate, "MMMM d, yyyy")}</p>
                          {passport.expiryDate < new Date() && (
                            <Badge className="bg-red-100 text-red-800 mt-1">Expired</Badge>
                          )}
                          {passport.expiryDate > new Date() && passport.expiryDate < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) && (
                            <Badge className="bg-yellow-100 text-yellow-800 mt-1">Expiring Soon</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Status</p>
                          <Badge>{passport.status}</Badge>
                        </div>
                        {passport.ticketReference && (
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Ticket Reference</p>
                            <p>{passport.ticketReference}</p>
                          </div>
                        )}
                      </div>
                      
                      {passport.notes && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Notes</p>
                          <p className="text-sm">{passport.notes}</p>
                        </div>
                      )}
                      
                      <div className="text-sm text-muted-foreground">
                        Last updated: {format(passport.lastUpdated, "MMMM d, yyyy")}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 space-y-2">
                      <p className="text-muted-foreground">No passport information available</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="flights" className="space-y-4">
                  {flights.length > 0 ? (
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
                                  {format(flight.departureDate, "MMM d, yyyy")}
                                  {flight.returnDate && (
                                    <span className="block text-xs text-muted-foreground">
                                      to {format(flight.returnDate, "MMM d, yyyy")}
                                    </span>
                                  )}
                                </td>
                                <td className="p-4 align-middle">
                                  {flight.origin} → {flight.destination}
                                </td>
                                <td className="p-4 align-middle">
                                  {flight.airlineName}
                                  {flight.flightNumber && (
                                    <span className="block text-xs text-muted-foreground">
                                      {flight.flightNumber}
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
                  {tickets.length > 0 ? (
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
                                  {format(ticket.departureDate, "MMM d, yyyy")}
                                  {ticket.returnDate && (
                                    <span className="block text-xs text-muted-foreground">
                                      to {format(ticket.returnDate, "MMM d, yyyy")}
                                    </span>
                                  )}
                                </td>
                                <td className="p-4 align-middle">
                                  {ticket.origin} → {ticket.destination}
                                </td>
                                <td className="p-4 align-middle">
                                  {ticket.airlineName}
                                  {ticket.flightNumber && (
                                    <span className="block text-xs text-muted-foreground">
                                      {ticket.flightNumber}
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
                      
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/tickets">View All Tickets</Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 space-y-2">
                      <TicketIcon className="h-10 w-10 text-muted-foreground/50" />
                      <p className="text-muted-foreground">No ticket information available</p>
                    </div>
                  )}
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
