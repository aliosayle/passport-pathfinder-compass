
import { Flight } from "@/types";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plane, User } from "lucide-react";

interface FlightDetailProps {
  flight: Flight;
  onEdit: () => void;
  onClose: () => void;
}

const FlightDetail = ({ flight, onEdit, onClose }: FlightDetailProps) => {
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
      
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <User className="mr-1 h-4 w-4" />
              Employee Information
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-medium">{flight.employeeName}</h3>
              <p className="text-sm text-muted-foreground">ID: {flight.employeeId}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-1 h-4 w-4" />
              Travel Dates
            </div>
            <div className="space-y-1">
              <p>Departure: {format(flight.departureDate, "MMMM d, yyyy")}</p>
              {flight.returnDate && (
                <p>Return: {format(flight.returnDate, "MMMM d, yyyy")}</p>
              )}
              {flight.returnDate && (
                <p className="text-sm text-muted-foreground">
                  Duration: {Math.ceil((flight.returnDate.getTime() - flight.departureDate.getTime()) / (1000 * 60 * 60 * 24))} days
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
              <p>Airline: {flight.airlineName}</p>
              {flight.flightNumber && <p>Flight Number: {flight.flightNumber}</p>}
              <p>Ticket Reference: {flight.ticketReference}</p>
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
      
      <div className="pt-2 text-sm text-muted-foreground">
        Last updated: {format(flight.lastUpdated, "MMMM d, yyyy 'at' h:mm a")}
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button onClick={onEdit}>
          Edit
        </Button>
      </div>
    </div>
  );
};

export default FlightDetail;
