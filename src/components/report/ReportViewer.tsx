import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "../ui/card";
import { Badge } from "../ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { format, parseISO } from "date-fns";
import { EmployeeReport } from "../../services/reportService";

interface ReportViewerProps {
  report: EmployeeReport;
}

export default function ReportViewer({ report }: ReportViewerProps) {
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(parseISO(dateString), "MMM dd, yyyy");
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-muted/50">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Employee Report</CardTitle>
              <CardDescription>
                Period: {formatDate(report.reportPeriod.startDate)} to {formatDate(report.reportPeriod.endDate)}
              </CardDescription>
            </div>
            <Badge variant="outline">
              Generated: {formatDate(report.generatedAt)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Employee Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Employee Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="font-medium">ID:</dt>
                    <dd>{report.employee.id}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Name:</dt>
                    <dd>{report.employee.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Department:</dt>
                    <dd>{report.employee.department || "N/A"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Position:</dt>
                    <dd>{report.employee.position || "N/A"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Email:</dt>
                    <dd>{report.employee.email || "N/A"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Phone:</dt>
                    <dd>{report.employee.phone || "N/A"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Nationality:</dt>
                    <dd>{report.employee.nationality || "N/A"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Join Date:</dt>
                    <dd>{formatDate(report.employee.join_date) || "N/A"}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Passport Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Passport Information</CardTitle>
              </CardHeader>
              <CardContent>
                {report.passport ? (
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="font-medium">Number:</dt>
                      <dd>{report.passport.passport_number}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Nationality:</dt>
                      <dd>{report.passport.nationality}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Issue Date:</dt>
                      <dd>{formatDate(report.passport.issue_date)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Expiry Date:</dt>
                      <dd>{formatDate(report.passport.expiry_date)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Status:</dt>
                      <dd>
                        <Badge variant={
                          report.passport.status === 'With Company' ? 'default' : 
                          report.passport.status === 'With Employee' ? 'secondary' : 
                          'outline'
                        }>
                          {report.passport.status}
                        </Badge>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Last Updated:</dt>
                      <dd>{formatDate(report.passport.last_updated)}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="text-muted-foreground italic">No passport information available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Report Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Flights</p>
                  <p className="text-2xl font-bold">{report.summary.totalFlights}</p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Transfers</p>
                  <p className="text-2xl font-bold">{report.summary.totalTransfers}</p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Transfer Amount</p>
                  <p className="text-2xl font-bold">
                    {report.summary.totalTransferAmount.toFixed(2)} 
                    {report.summary.currencies.length === 1 ? report.summary.currencies[0] : ''}
                  </p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Destinations</p>
                  <p className="text-2xl font-bold">{report.summary.destinations.length}</p>
                </div>
              </div>
              
              {report.summary.currencies.length > 1 && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">Multiple currencies used: {report.summary.currencies.join(', ')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabbed content for flights, tickets and transfers */}
          <Tabs defaultValue="flights" className="mt-6">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="flights">Flights ({report.flights.length})</TabsTrigger>
              <TabsTrigger value="tickets">Tickets ({report.tickets.length})</TabsTrigger>
              <TabsTrigger value="transfers">Money Transfers ({report.transfers.length})</TabsTrigger>
            </TabsList>
            
            {/* Flights Tab */}
            <TabsContent value="flights" className="mt-4">
              {report.flights.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Flight</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead>Origin</TableHead>
                        <TableHead>Airline</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Type</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.flights.map((flight) => (
                        <TableRow key={flight.id}>
                          <TableCell>{flight.flight_number || "N/A"}</TableCell>
                          <TableCell>{formatDate(flight.departure_date)}</TableCell>
                          <TableCell>{flight.destination}</TableCell>
                          <TableCell>{flight.origin}</TableCell>
                          <TableCell>{flight.airline_name || "N/A"}</TableCell>
                          <TableCell>
                            <Badge variant={
                              flight.status === 'Completed' ? 'default' : 
                              flight.status === 'Pending' ? 'secondary' : 
                              flight.status === 'Cancelled' ? 'destructive' : 
                              'outline'
                            }>
                              {flight.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{flight.type}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted-foreground italic">No flights during this period</p>
              )}
            </TabsContent>
            
            {/* Tickets Tab */}
            <TabsContent value="tickets" className="mt-4">
              {report.tickets.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reference</TableHead>
                        <TableHead>Issue Date</TableHead>
                        <TableHead>Airline</TableHead>
                        <TableHead>Departure</TableHead>
                        <TableHead>Return</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.tickets.map((ticket) => (
                        <TableRow key={ticket.id}>
                          <TableCell>{ticket.reference}</TableCell>
                          <TableCell>{formatDate(ticket.issue_date)}</TableCell>
                          <TableCell>{ticket.airline_name}</TableCell>
                          <TableCell>{formatDate(ticket.departure_date)}</TableCell>
                          <TableCell>{ticket.return_date ? formatDate(ticket.return_date) : "N/A"}</TableCell>
                          <TableCell>
                            {ticket.cost ? `${ticket.cost.toFixed(2)} ${ticket.currency}` : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              ticket.status === 'Completed' ? 'default' : 
                              ticket.status === 'Pending' ? 'secondary' : 
                              ticket.status === 'Cancelled' ? 'destructive' : 
                              'outline'
                            }>
                              {ticket.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted-foreground italic">No tickets during this period</p>
              )}
            </TabsContent>
            
            {/* Money Transfers Tab */}
            <TabsContent value="transfers" className="mt-4">
              {report.transfers.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead>Beneficiary</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.transfers.map((transfer) => (
                        <TableRow key={transfer.id}>
                          <TableCell>{formatDate(transfer.date)}</TableCell>
                          <TableCell>{`${transfer.amount} ${transfer.currency}`}</TableCell>
                          <TableCell>{transfer.destination}</TableCell>
                          <TableCell>{transfer.beneficiary_name}</TableCell>
                          <TableCell>
                            <Badge variant={
                              transfer.status === 'Completed' ? 'default' : 
                              transfer.status === 'Pending' ? 'secondary' : 
                              transfer.status === 'Failed' ? 'destructive' : 
                              'outline'
                            }>
                              {transfer.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">{transfer.notes || "N/A"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted-foreground italic">No money transfers during this period</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}