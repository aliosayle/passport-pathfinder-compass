import { Flight } from "@/types";
import { Button } from "@/components/ui/button";
import { format, parseISO, isValid } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plane, User, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState } from "react";

interface FlightDetailProps {
  flight: Flight;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const FlightDetail = ({ flight, onEdit, onDelete, onClose }: FlightDetailProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const formatDate = (dateValue: string | Date | null | undefined, formatString: string): string => {
    if (!dateValue) return "N/A";
    
    try {
      const date = typeof dateValue === 'string' ? parseISO(dateValue) : dateValue;
      
      if (!isValid(date)) return "Invalid date";
      
      return format(date, formatString);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };
  
  const calculateDuration = (start: string | Date | undefined, end: string | Date | undefined): number | null => {
    if (!start || !end) return null;
    
    try {
      const startDate = typeof start === 'string' ? parseISO(start) : start;
      const endDate = typeof end === 'string' ? parseISO(end) : end;
      
      if (!isValid(startDate) || !isValid(endDate)) return null;
      
      return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    } catch (error) {
      return null;
    }
  };

  const employeeName = flight.employee_name || flight.employeeName || "N/A";
  const employeeId = flight.employee_id || flight.employeeId || "N/A";
  
  const departureDate = flight.departure_date || flight.departureDate;
  const returnDate = flight.return_date || flight.returnDate;
  const airlineName = flight.airline_name || flight.airlineName || "N/A";
  const flightNumber = flight.flight_number || flight.flightNumber;
  const ticketReference = flight.ticket_reference || flight.ticketReference || "N/A";
  const lastUpdated = flight.last_updated || flight.lastUpdated;
  
  const duration = calculateDuration(departureDate, returnDate);

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

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "Business":
        return "bg-purple-100 text-purple-800";
      case "Vacation":
        return "bg-blue-100 text-blue-800";
      case "Sick Leave":
        return "bg-red-100 text-red-800";
      case "Family Emergency":
        return "bg-orange-100 text-orange-800";
      case "Training":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Flight Details</h2>
        <div className="flex space-x-2">
          <Badge className={getStatusBadgeColor(flight.status)}>
            {flight.status}
          </Badge>
          <Badge className={getTypeBadgeColor(flight.type)}>
            {flight.type}
          </Badge>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <User className="mr-1 h-4 w-4" />
                  Employee Information
                </div>
                <div className="space-y-1">
                  <Link 
                    to={`/employee/${employeeId}`}
                    className="text-lg font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {employeeName}
                  </Link>
                  <p className="text-sm text-muted-foreground">ID: {employeeId}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-1 h-4 w-4" />
                  Travel Dates
                </div>
                <div className="space-y-1">
                  <p>Departure: {formatDate(departureDate, "MMMM d, yyyy")}</p>
                  {returnDate && (
                    <p>Return: {formatDate(returnDate, "MMMM d, yyyy")}</p>
                  )}
                  {duration && (
                    <p className="text-sm text-muted-foreground">
                      Duration: {duration} days
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Plane className="mr-1 h-4 w-4" />
                  Flight Information
                </div>
                <div className="space-y-1">
                  <p className="text-base font-medium">{flight.origin} → {flight.destination}</p>
                  <p>Airline: {airlineName}</p>
                  {flightNumber && <p>Flight Number: {flightNumber}</p>}
                  <p>Ticket Reference: {ticketReference}</p>
                </div>
              </div>
              
              {flight.notes && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Notes</div>
                  <p className="text-sm">{flight.notes}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {lastUpdated && (
        <div className="pt-2 text-sm text-muted-foreground">
          Last updated: {formatDate(lastUpdated, "MMMM d, yyyy 'at' h:mm a")}
        </div>
      )}
      
      <div className="flex justify-end space-x-2">
        <Button 
          variant="destructive" 
          onClick={() => setIsDeleteDialogOpen(true)}
          className="mr-auto"
        >
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </Button>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button onClick={onEdit}>
          Edit
        </Button>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the flight record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setIsDeleteDialogOpen(false);
              onDelete();
            }} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FlightDetail;
