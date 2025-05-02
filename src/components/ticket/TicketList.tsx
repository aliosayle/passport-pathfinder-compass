
import { useState } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Ticket } from "@/types";
import { tickets, ticketStatuses } from "@/lib/data";
import { Ticket as TicketIcon, Filter } from "lucide-react";
import { format } from "date-fns";
import TicketForm from "./TicketForm";
import TicketDetail from "./TicketDetail";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface TicketListProps {
  onSelect?: (ticket: Ticket) => void;
}

const TicketList = ({ onSelect }: TicketListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.airlineName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || ticket.status === statusFilter;
    
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
              <SelectItem value="">All Statuses</SelectItem>
              {ticketStatuses.map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

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
                  <TableCell>{ticket.employeeName}</TableCell>
                  <TableCell>
                    {ticket.origin} → {ticket.destination}
                  </TableCell>
                  <TableCell>
                    {format(ticket.departureDate, "MMM d, yyyy")}
                    {ticket.returnDate && (
                      <>
                        <br />
                        <span className="text-muted-foreground">
                          to {format(ticket.returnDate, "MMM d, yyyy")}
                        </span>
                      </>
                    )}
                  </TableCell>
                  <TableCell>{ticket.airlineName}</TableCell>
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

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <TicketForm
            ticket={selectedTicket || undefined}
            onClose={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[700px]">
          {selectedTicket && (
            <TicketDetail
              ticket={selectedTicket}
              onEdit={() => {
                setIsDetailOpen(false);
                setSelectedTicket(selectedTicket);
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

export default TicketList;
