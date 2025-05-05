import { Ticket } from "@/types";
import { Button } from "@/components/ui/button";
import { format, parseISO, isValid } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plane, User, TicketIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface TicketDetailProps {
  ticket: Ticket;
  onEdit: () => void;
  onClose: () => void;
}

const TicketDetail = ({ ticket, onEdit, onClose }: TicketDetailProps) => {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Used":
        return "bg-blue-100 text-blue-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      case "Expired":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateValue: string | Date | null | undefined, formatString: string): string => {
    if (!dateValue) return "N/A";

    try {
      const date = typeof dateValue === "string" ? parseISO(dateValue) : dateValue;

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
      const startDate = typeof start === "string" ? parseISO(start) : start;
      const endDate = typeof end === "string" ? parseISO(end) : end;

      if (!isValid(startDate) || !isValid(endDate)) return null;

      return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    } catch (error) {
      return null;
    }
  };

  const departureDate = ticket.departureDate
    ? typeof ticket.departureDate === "string"
      ? parseISO(ticket.departureDate)
      : ticket.departureDate
    : null;

  const returnDate = ticket.returnDate
    ? typeof ticket.returnDate === "string"
      ? parseISO(ticket.returnDate)
      : ticket.returnDate
    : null;

  const duration = calculateDuration(departureDate, returnDate);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TicketIcon className="h-5 w-5" />
          <h2 className="text-xl font-bold">Ticket Details</h2>
        </div>
        <Badge className={getStatusBadgeColor(ticket.status)}>{ticket.status}</Badge>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Ticket Reference</div>
                <div className="text-lg font-semibold">{ticket.reference}</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <User className="mr-1 h-4 w-4" />
                  Employee Information
                </div>
                <div className="space-y-1">
                  <Link
                    to={`/employee/${ticket.employeeId}`}
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {ticket.employeeName}
                  </Link>
                  <p className="text-sm text-muted-foreground">ID: {ticket.employeeId}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-1 h-4 w-4" />
                  Travel Dates
                </div>
                <div className="space-y-1">
                  <p>Departure: {formatDate(ticket.departureDate, "MMMM d, yyyy")}</p>
                  {ticket.returnDate && <p>Return: {formatDate(ticket.returnDate, "MMMM d, yyyy")}</p>}
                  {duration && (
                    <p className="text-sm text-muted-foreground">Duration: {duration} days</p>
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
                  <p className="text-base font-medium">
                    {ticket.origin} → {ticket.destination}
                  </p>
                  <p>Airline: {ticket.airlineName}</p>
                  {ticket.flightNumber && <p>Flight Number: {ticket.flightNumber}</p>}
                </div>
              </div>

              <div>
                <div className="text-sm text-muted-foreground">Issue Date</div>
                <p>{formatDate(ticket.issueDate, "MMMM d, yyyy")}</p>
              </div>

              {ticket.cost && (
                <div>
                  <div className="text-sm text-muted-foreground">Cost</div>
                  <p className="font-medium">
                    {typeof ticket.cost === "number"
                      ? ticket.cost.toLocaleString()
                      : parseFloat(ticket.cost).toLocaleString()}{" "}
                    {ticket.currency}
                  </p>
                </div>
              )}

              {ticket.notes && (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Notes</div>
                  <p className="text-sm">{ticket.notes}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="pt-2 text-sm text-muted-foreground">
        Last updated: {formatDate(ticket.lastUpdated, "MMMM d, yyyy 'at' h:mm a")}
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button onClick={onEdit}>Edit</Button>
      </div>
    </div>
  );
};

export default TicketDetail;
