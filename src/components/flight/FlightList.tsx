import { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Flight } from "@/types";
import { Plane, Filter, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import FlightForm from "./FlightForm";
import FlightDetail from "./FlightDetail";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { flightService } from "@/services/flightService";
import { useToast } from "@/hooks/use-toast";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define flight statuses and types
const flightStatuses = ["Pending", "Completed", "Cancelled", "Delayed"];
const flightTypes = ["Business", "Vacation", "Sick Leave", "Family Emergency", "Training"];

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
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  // Fetch flights from API
  const fetchFlights = async () => {
    try {
      setLoading(true);
      const data = await flightService.getAll();
      setFlights(data);
      setError("");
    } catch (err) {
      console.error("Error fetching flights:", err);
      setError("Failed to load flight data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  // Get unique flight types from existing data
  const uniqueFlightTypes = Array.from(
    new Set([
      ...flightTypes,
      ...flights.map(flight => flight.type || flight.flight_type)
        .filter(Boolean)
    ])
  );

  const filteredFlights = flights.filter(flight => {
    const matchesSearch = 
      (flight.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       flight.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (flight.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       flight.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (flight.destination?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (flight.origin?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (flight.airline_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       flight.airlineName?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      ((flight.flight_number || flight.flightNumber || '').toLowerCase().includes(searchTerm.toLowerCase()));
    
    const flightStatus = flight.status || "";
    const flightType = flight.type || flight.flight_type || "";
    
    const matchesStatus = statusFilter === "all" || flightStatus === statusFilter;
    const matchesType = typeFilter === "all" || flightType === typeFilter;
    
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

  const handleDeleteFlight = async (flightId: string) => {
    try {
      await flightService.delete(flightId);
      toast({
        title: "Flight Deleted",
        description: "The flight has been successfully deleted.",
      });
      fetchFlights(); // Refresh the list
      setIsDetailOpen(false);
    } catch (error) {
      console.error("Error deleting flight:", error);
      toast({
        title: "Error",
        description: "Failed to delete the flight. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (flightId: string, newStatus: string) => {
    try {
      await flightService.updateStatus(flightId, newStatus);
      toast({
        title: "Status Updated",
        description: `The flight status has been changed to ${newStatus}.`,
      });
      fetchFlights(); // Refresh the list
    } catch (error) {
      console.error("Error updating flight status:", error);
      toast({
        title: "Error",
        description: "Failed to update the flight status. Please try again.",
        variant: "destructive",
      });
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
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Parse dates safely
  const parseDate = (dateInput: string | Date | undefined) => {
    if (!dateInput) return null;
    try {
      return typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    } catch {
      return null;
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
                <SelectItem key={type as string} value={type as string}>{type as string}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading flight data...</span>
        </div>
      ) : (
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
                filteredFlights.map((flight) => {
                  const departureDate = parseDate(flight.departure_date || flight.departureDate);
                  const returnDate = parseDate(flight.return_date || flight.returnDate);
                  
                  return (
                    <TableRow key={flight.id}>
                      <TableCell>
                        <Link 
                          to={`/employee/${flight.employee_id || flight.employeeId}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {flight.employee_name || flight.employeeName}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {departureDate && format(departureDate, "MMM d, yyyy")}
                        {returnDate && (
                          <>
                            <br />
                            <span className="text-muted-foreground">
                              to {format(returnDate, "MMM d, yyyy")}
                            </span>
                          </>
                        )}
                      </TableCell>
                      <TableCell>
                        {flight.origin} → {flight.destination}
                      </TableCell>
                      <TableCell>
                        {flight.airline_name || flight.airlineName}
                        {(flight.flight_number || flight.flightNumber) && (
                          <span className="block text-xs text-muted-foreground">
                            {flight.flight_number || flight.flightNumber}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{flight.type || flight.flight_type}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(flight.status)}>
                          {flight.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleViewDetails(flight)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(flight.id, "Completed")}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                              Mark as Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(flight.id, "Cancelled")}>
                              <XCircle className="mr-2 h-4 w-4 text-red-600" />
                              Mark as Cancelled
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(flight.id, "Delayed")}>
                              <Clock className="mr-2 h-4 w-4 text-yellow-600" />
                              Mark as Delayed
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <FlightForm
            flight={selectedFlight || undefined}
            onSubmit={(flightData) => {
              fetchFlights(); // Refresh the list after submit
              setIsFormOpen(false);
            }}
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
                setIsFormOpen(true);
              }}
              onDelete={() => handleDeleteFlight(selectedFlight.id)}
              onClose={() => setIsDetailOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FlightList;
