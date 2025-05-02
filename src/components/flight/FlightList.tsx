
import { useState } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Flight } from "@/types";
import { flights, flightStatuses, flightTypes } from "@/lib/data";
import { Plane, Filter } from "lucide-react";
import { format } from "date-fns";
import FlightForm from "./FlightForm";
import FlightDetail from "./FlightDetail";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface FlightListProps {
  onSelect?: (flight: Flight) => void;
}

const FlightList = ({ onSelect }: FlightListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

  // Get unique flight types including custom ones
  const uniqueFlightTypes = Array.from(
    new Set([...flightTypes, ...flights.map(flight => flight.type)])
  );

  const filteredFlights = flights.filter(flight => {
    const matchesSearch = 
      flight.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.airlineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (flight.flightNumber && flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || flight.status === statusFilter;
    const matchesType = typeFilter === "all" || flight.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleViewDetails = (flight: Flight) => {
    setSelectedFlight(flight);
    setIsDetailOpen(true);
  };

  const handleAddNew = () => {
    setSelectedFlight(null);
    setIsFormOpen(true);
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
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Plane className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Employee Flights</h2>
        </div>
        <Button onClick={handleAddNew}>Add New Flight</Button>
      </div>

      <div className="flex items-center space-x-2 pb-4">
        <Input
          placeholder="Search by employee, destination, airline..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {flightStatuses.map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {uniqueFlightTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Airline</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFlights.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No flights found
                </TableCell>
              </TableRow>
            ) : (
              filteredFlights.map((flight) => (
                <TableRow key={flight.id}>
                  <TableCell>
                    <Link 
                      to={`/employee/${flight.employeeId}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {flight.employeeName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {format(flight.departureDate, "MMM d, yyyy")}
                    {flight.returnDate && (
                      <>
                        <br />
                        <span className="text-muted-foreground">
                          to {format(flight.returnDate, "MMM d, yyyy")}
                        </span>
                      </>
                    )}
                  </TableCell>
                  <TableCell>
                    {flight.origin} → {flight.destination}
                  </TableCell>
                  <TableCell>
                    {flight.airlineName}
                    {flight.flightNumber && (
                      <span className="block text-xs text-muted-foreground">
                        {flight.flightNumber}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{flight.type}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(flight.status)}>
                      {flight.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(flight)}
                    >
                      View
                    </Button>
                    {onSelect && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelect(flight)}
                        className="ml-2"
                      >
                        Select
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <FlightForm
            flight={selectedFlight || undefined}
            onClose={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[700px]">
          {selectedFlight && (
            <FlightDetail
              flight={selectedFlight}
              onEdit={() => {
                setIsDetailOpen(false);
                setSelectedFlight(selectedFlight);
                setIsFormOpen(true);
              }}
              onClose={() => setIsDetailOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FlightList;
