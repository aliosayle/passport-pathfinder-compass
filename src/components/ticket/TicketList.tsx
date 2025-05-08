import { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Ticket } from "@/types";
import { ticketStatuses } from "@/lib/data";
import { Ticket as TicketIcon, Filter, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import TicketForm from "./TicketForm";
import TicketDetail from "./TicketDetail";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ticketService } from "@/services/ticketService";
import { useToast } from "@/hooks/use-toast";

interface TicketListProps {
  onSelect?: (ticket: Ticket) => void;
}

const TicketList = ({ onSelect }: TicketListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  // Fetch tickets from API
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await ticketService.getAll();
      setTickets(data);
      setError("");
    } catch (err) {
      console.error("Error fetching tickets:", err);
      setError("Failed to load ticket data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      (ticket.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (ticket.reference?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (ticket.destination?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (ticket.airline_name?.toLowerCase().includes(searchTerm.toLowerCase()) || '');
    
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsDetailOpen(true);
  };

  const handleAddNew = () => {
    setSelectedTicket(null);
    setIsFormOpen(true);
  };

  const handleDeleteTicket = async (ticketId: string) => {
    try {
      await ticketService.delete(ticketId);
      toast({
        title: "Ticket Deleted",
        description: "The ticket has been successfully deleted.",
      });
      fetchTickets(); // Refresh the list
      setIsDetailOpen(false);
    } catch (error) {
      console.error("Error deleting ticket:", error);
      toast({
        title: "Error",
        description: "Failed to delete the ticket. Please try again.",
        variant: "destructive",
      });
    }
  };

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
          <TicketIcon className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Travel Tickets</h2>
        </div>
        <Button onClick={handleAddNew}>Add New Ticket</Button>
      </div>

      <div className="flex items-center space-x-2 pb-4">
        <Input
          placeholder="Search by employee, reference, destination..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {ticketStatuses.map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
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
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2">Loading tickets...</span>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Airline</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No tickets found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">{ticket.reference}</TableCell>
                    <TableCell>
                      <Link 
                        to={`/employee/${ticket.employee_id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {ticket.employee_name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {ticket.origin} → {ticket.destination}
                    </TableCell>
                    <TableCell>
                      {ticket.departure_date && parseDate(ticket.departure_date) ? 
                        format(parseDate(ticket.departure_date) as Date, "MMM d, yyyy") : 
                        'N/A'
                      }
                      {ticket.return_date && parseDate(ticket.return_date) && (
                        <>
                          <br />
                          <span className="text-muted-foreground">
                            to {format(parseDate(ticket.return_date) as Date, "MMM d, yyyy")}
                          </span>
                        </>
                      )}
                    </TableCell>
                    <TableCell>{ticket.airline_name}</TableCell>
                    <TableCell>
                      {ticket.cost ? `${ticket.cost} ${ticket.currency || 'USD'}` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(ticket)}
                      >
                        View
                      </Button>
                      {onSelect && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSelect(ticket)}
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
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogTitle>
            {selectedTicket ? "Edit Ticket" : "Add New Ticket"}
          </DialogTitle>
          <DialogDescription>
            {selectedTicket ? "Update existing ticket information" : "Enter details for the new ticket"}
          </DialogDescription>
          <TicketForm
            ticket={selectedTicket || undefined}
            onClose={() => setIsFormOpen(false)}
            onSave={() => {
              setIsFormOpen(false);
              fetchTickets();
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogTitle>Ticket Details</DialogTitle>
          <DialogDescription>
            View complete information about this ticket
          </DialogDescription>
          {selectedTicket && (
            <TicketDetail
              ticket={selectedTicket}
              onEdit={() => {
                setIsDetailOpen(false);
                setSelectedTicket(selectedTicket);
                setIsFormOpen(true);
              }}
              onDelete={() => handleDeleteTicket(selectedTicket.id)}
              onClose={() => setIsDetailOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TicketList;
