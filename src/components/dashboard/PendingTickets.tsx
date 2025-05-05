import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TicketIcon, Plane, MoreHorizontal, Calendar, ArrowUpRight, Users, AlertTriangle } from "lucide-react";
import { Ticket, TicketStatus } from "@/services/ticketService";
import { ticketService } from "@/services/ticketService";
import { flightService } from "@/services/flightService";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isValid } from "date-fns";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import TicketForm from "@/components/ticket/TicketForm";
import TicketDetail from "@/components/ticket/TicketDetail";

/**
 * PendingTickets displays tickets that need processing:
 * - Pending tickets that need to be converted to flights
 * - Active tickets with return legs needing to be processed
 */
const PendingTickets = () => {
  const [pendingTickets, setPendingTickets] = useState<Ticket[]>([]);
  const [activeTickets, setActiveTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    ticketId: string;
    action: string;
    title: string;
    description: string;
  }>({
    isOpen: false,
    ticketId: "",
    action: "",
    title: "",
    description: ""
  });
  
  const { toast } = useToast();

  // Fetch pending and active tickets
  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const pending = await ticketService.getPendingTickets();
      const active = await ticketService.getActiveTickets();
      setPendingTickets(pending);
      setActiveTickets(active);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load tickets. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Format date safely
  const formatDate = (dateValue: string | Date | null | undefined): string => {
    if (!dateValue) return "—";
    
    try {
      const date = typeof dateValue === 'string' ? parseISO(dateValue) : dateValue;
      return isValid(date) ? format(date, "MMM d, yyyy") : "Invalid date";
    } catch (error) {
      return "Invalid date";
    }
  };
  
  // Create flight from ticket
  const createFlight = async (ticketId: string, isReturn: boolean = false) => {
    try {
      await ticketService.createFlightFromTicket(ticketId, isReturn);
      
      toast({
        title: `Flight Created`,
        description: `Flight has been created successfully.`
      });
      
      // Refresh tickets list
      fetchTickets();
    } catch (error) {
      console.error("Error creating flight from ticket:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to create flight. Please try again.`
      });
    }
  };
  
  // Update ticket status
  const updateStatus = async (ticketId: string, status: TicketStatus, notes?: string) => {
    try {
      await ticketService.updateStatus(ticketId, status, notes);
      
      toast({
        title: `Status Updated`,
        description: `Ticket status has been updated to ${status}.`
      });
      
      // Refresh tickets list
      fetchTickets();
    } catch (error) {
      console.error("Error updating ticket status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update status. Please try again.`
      });
    }
  };
  
  // Handle action confirmations
  const handleConfirmAction = () => {
    const { ticketId, action } = confirmAction;
    
    switch (action) {
      case "createDepartureFlight":
        createFlight(ticketId, false);
        break;
      case "createReturnFlight":
        createFlight(ticketId, true);
        break;
      case "cancel":
        updateStatus(ticketId, "Cancelled", "Ticket cancelled by user");
        break;
      case "complete":
        updateStatus(ticketId, "Completed", "Ticket marked as completed");
        break;
      default:
        break;
    }
    
    // Close dialog
    setConfirmAction({ ...confirmAction, isOpen: false });
  };
  
  const openDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Pending Tickets Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <TicketIcon className="h-5 w-5 mr-2" />
                Pending Tickets
              </CardTitle>
              <CardDescription>
                Tickets that need to be processed into flights
              </CardDescription>
            </div>
            <Button 
              onClick={() => {
                setSelectedTicket(null);
                setIsFormOpen(true);
              }}
            >
              Add New Ticket
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading tickets...</p>
            </div>
          ) : pendingTickets.length === 0 ? (
            <div className="py-10 text-center border rounded-md bg-muted/20">
              <TicketIcon className="h-10 w-10 mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">No pending tickets</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSelectedTicket(null);
                  setIsFormOpen(true);
                }}
              >
                Add a ticket
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Departure</TableHead>
                  <TableHead>Return</TableHead>
                  <TableHead>Airline</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingTickets.map((ticket) => (
                  <TableRow key={ticket.id} className="group hover:bg-muted/50">
                    <TableCell onClick={() => openDetails(ticket)} className="font-medium cursor-pointer">
                      {ticket.reference}
                    </TableCell>
                    <TableCell onClick={() => openDetails(ticket)} className="cursor-pointer">
                      {ticket.employee_name}
                    </TableCell>
                    <TableCell onClick={() => openDetails(ticket)} className="cursor-pointer">
                      {ticket.origin} → {ticket.destination}
                    </TableCell>
                    <TableCell onClick={() => openDetails(ticket)} className="cursor-pointer">
                      {formatDate(ticket.departure_date)}
                    </TableCell>
                    <TableCell onClick={() => openDetails(ticket)} className="cursor-pointer">
                      {ticket.return_date ? formatDate(ticket.return_date) : "—"}
                    </TableCell>
                    <TableCell onClick={() => openDetails(ticket)} className="cursor-pointer">
                      {ticket.airline_name}
                    </TableCell>
                    <TableCell onClick={() => openDetails(ticket)} className="cursor-pointer">
                      <Badge variant="outline">{ticket.type}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setConfirmAction({
                            isOpen: true,
                            ticketId: ticket.id,
                            action: "createDepartureFlight",
                            title: "Create Flight",
                            description: `Are you sure you want to create a flight for ticket ${ticket.reference}?`
                          })}
                        >
                          <Plane className="h-4 w-4 mr-1" />
                          Create Flight
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => openDetails(ticket)}
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setIsFormOpen(true);
                              }}
                            >
                              Edit Ticket
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setConfirmAction({
                                isOpen: true,
                                ticketId: ticket.id,
                                action: "cancel",
                                title: "Cancel Ticket",
                                description: `Are you sure you want to cancel ticket ${ticket.reference}? This action cannot be undone.`
                              })}
                              className="text-red-600"
                            >
                              Cancel Ticket
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Active Tickets Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ArrowUpRight className="h-5 w-5 mr-2" />
            Active Tickets with Return Legs
          </CardTitle>
          <CardDescription>
            Tickets with processed departure flights that have pending return legs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading tickets...</p>
            </div>
          ) : activeTickets.length === 0 ? (
            <div className="py-10 text-center border rounded-md bg-muted/20">
              <Calendar className="h-10 w-10 mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">No active tickets with return legs</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Return Date</TableHead>
                  <TableHead>Airline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeTickets.map((ticket) => (
                  <TableRow key={ticket.id} className="group hover:bg-muted/50">
                    <TableCell onClick={() => openDetails(ticket)} className="font-medium cursor-pointer">
                      {ticket.reference}
                    </TableCell>
                    <TableCell onClick={() => openDetails(ticket)} className="cursor-pointer">
                      {ticket.employee_name}
                    </TableCell>
                    <TableCell onClick={() => openDetails(ticket)} className="cursor-pointer">
                      {ticket.destination} → {ticket.origin}
                      <span className="block text-xs text-muted-foreground">Return journey</span>
                    </TableCell>
                    <TableCell onClick={() => openDetails(ticket)} className="cursor-pointer">
                      {formatDate(ticket.return_date)}
                    </TableCell>
                    <TableCell onClick={() => openDetails(ticket)} className="cursor-pointer">
                      {ticket.airline_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setConfirmAction({
                            isOpen: true,
                            ticketId: ticket.id,
                            action: "createReturnFlight",
                            title: "Create Return Flight",
                            description: `Are you sure you want to create a return flight for ticket ${ticket.reference}?`
                          })}
                        >
                          <Plane className="h-4 w-4 mr-1" />
                          Process Return
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => openDetails(ticket)}
                            >
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setConfirmAction({
                                isOpen: true,
                                ticketId: ticket.id,
                                action: "complete",
                                title: "Mark as Completed",
                                description: `Are you sure you want to mark this ticket as completed? This will skip processing the return flight.`
                              })}
                            >
                              Mark as Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setConfirmAction({
                                isOpen: true,
                                ticketId: ticket.id,
                                action: "cancel",
                                title: "Cancel Return",
                                description: `Are you sure you want to cancel the return portion of ticket ${ticket.reference}?`
                              })}
                              className="text-red-600"
                            >
                              Cancel Return
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Ticket Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogTitle className="text-xl font-semibold">Ticket Details</DialogTitle>
          {selectedTicket && (
            <TicketDetail
              ticket={selectedTicket}
              onEdit={() => {
                setIsDetailOpen(false);
                setIsFormOpen(true);
              }}
              onClose={() => setIsDetailOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Ticket Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogTitle className="text-xl font-semibold">
            {selectedTicket ? "Edit Ticket" : "Add New Ticket"}
          </DialogTitle>
          <TicketForm
            ticket={selectedTicket || undefined}
            onClose={() => setIsFormOpen(false)}
            onSave={() => {
              fetchTickets();
              setIsFormOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
      
      {/* Confirmation Dialog */}
      <AlertDialog 
        open={confirmAction.isOpen} 
        onOpenChange={(isOpen) => setConfirmAction({ ...confirmAction, isOpen })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmAction.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmAction.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PendingTickets;