
import { useState } from "react";
import { Ticket } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { addTicket, updateTicket, airlines, ticketStatuses } from "@/lib/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TicketFormProps {
  ticket?: Ticket;
  onClose: () => void;
}

const TicketForm = ({ ticket, onClose }: TicketFormProps) => {
  const [reference, setReference] = useState(ticket?.reference || "");
  const [employeeName, setEmployeeName] = useState(ticket?.employeeName || "");
  const [employeeId, setEmployeeId] = useState(ticket?.employeeId || "");
  const [issueDate, setIssueDate] = useState<Date>(ticket?.issueDate || new Date());
  const [departureDate, setDepartureDate] = useState<Date | undefined>(ticket?.departureDate);
  const [returnDate, setReturnDate] = useState<Date | undefined>(ticket?.returnDate);
  const [destination, setDestination] = useState(ticket?.destination || "");
  const [origin, setOrigin] = useState(ticket?.origin || "");
  const [airlineId, setAirlineId] = useState(ticket?.airlineId || "");
  const [airlineName, setAirlineName] = useState(ticket?.airlineName || "");
  const [flightNumber, setFlightNumber] = useState(ticket?.flightNumber || "");
  const [cost, setCost] = useState(ticket?.cost?.toString() || "");
  const [currency, setCurrency] = useState(ticket?.currency || "USD");
  const [status, setStatus] = useState(ticket?.status || "Active");
  const [notes, setNotes] = useState(ticket?.notes || "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { toast } = useToast();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!reference.trim()) {
      newErrors.reference = "Reference is required";
    }
    
    if (!employeeName.trim()) {
      newErrors.employeeName = "Employee name is required";
    }
    
    if (!employeeId.trim()) {
      newErrors.employeeId = "Employee ID is required";
    }
    
    if (!departureDate) {
      newErrors.departureDate = "Departure date is required";
    }
    
    if (returnDate && departureDate && returnDate < departureDate) {
      newErrors.returnDate = "Return date must be after departure date";
    }
    
    if (!destination.trim()) {
      newErrors.destination = "Destination is required";
    }
    
    if (!origin.trim()) {
      newErrors.origin = "Origin is required";
    }
    
    if (!airlineId) {
      newErrors.airlineId = "Airline is required";
    }
    
    if (cost && isNaN(parseFloat(cost))) {
      newErrors.cost = "Cost must be a valid number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAirlineChange = (id: string) => {
    setAirlineId(id);
    const airline = airlines.find(a => a.id === id);
    setAirlineName(airline?.name || "");
  };

  const currencyOptions = ["USD", "EUR", "GBP", "AED", "JPY", "CAD", "AUD"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    try {
      const ticketData = {
        reference,
        employeeName,
        employeeId,
        issueDate,
        departureDate: departureDate!,
        returnDate,
        destination,
        origin,
        airlineId,
        airlineName,
        flightNumber: flightNumber || undefined,
        cost: cost ? parseFloat(cost) : undefined,
        currency: cost ? currency : undefined,
        status,
        notes: notes || undefined,
      };

      if (ticket) {
        // Update existing
        updateTicket({
          ...ticket,
          ...ticketData,
        });
        toast({
          title: "Ticket Updated",
          description: `Ticket ${reference} has been updated successfully.`
        });
      } else {
        // Create new
        addTicket(ticketData);
        toast({
          title: "Ticket Added",
          description: `New ticket ${reference} has been added successfully.`
        });
      }
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error processing the ticket data.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        {ticket ? "Edit Ticket" : "Add New Ticket"}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="reference">Ticket Reference</Label>
            <Input
              id="reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="T12345"
              className={errors.reference ? "border-destructive" : ""}
            />
            {errors.reference && <p className="text-sm text-destructive">{errors.reference}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="issueDate">Issue Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="issueDate"
                  variant={"outline"}
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {issueDate ? format(issueDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={issueDate}
                  onSelect={(date) => date && setIssueDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="employeeName">Employee Name</Label>
            <Input
              id="employeeName"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              placeholder="John Smith"
              className={errors.employeeName ? "border-destructive" : ""}
            />
            {errors.employeeName && <p className="text-sm text-destructive">{errors.employeeName}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="employeeId">Employee ID</Label>
            <Input
              id="employeeId"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="EMP001"
              className={errors.employeeId ? "border-destructive" : ""}
            />
            {errors.employeeId && <p className="text-sm text-destructive">{errors.employeeId}</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="departureDate">Departure Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="departureDate"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !departureDate && "text-muted-foreground",
                    errors.departureDate && "border-destructive"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {departureDate ? format(departureDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={departureDate}
                  onSelect={setDepartureDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.departureDate && <p className="text-sm text-destructive">{errors.departureDate}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="returnDate">Return Date (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="returnDate"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !returnDate && "text-muted-foreground",
                    errors.returnDate && "border-destructive"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {returnDate ? format(returnDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={returnDate}
                  onSelect={setReturnDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.returnDate && <p className="text-sm text-destructive">{errors.returnDate}</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="origin">Origin</Label>
            <Input
              id="origin"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Dubai"
              className={errors.origin ? "border-destructive" : ""}
            />
            {errors.origin && <p className="text-sm text-destructive">{errors.origin}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="destination">Destination</Label>
            <Input
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="London"
              className={errors.destination ? "border-destructive" : ""}
            />
            {errors.destination && <p className="text-sm text-destructive">{errors.destination}</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="airline">Airline</Label>
            <Select value={airlineId} onValueChange={handleAirlineChange}>
              <SelectTrigger id="airline" className={errors.airlineId ? "border-destructive" : ""}>
                <SelectValue placeholder="Select an airline" />
              </SelectTrigger>
              <SelectContent>
                {airlines.map((airline) => (
                  <SelectItem key={airline.id} value={airline.id}>
                    {airline.name} ({airline.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.airlineId && <p className="text-sm text-destructive">{errors.airlineId}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="flightNumber">Flight Number (Optional)</Label>
            <Input
              id="flightNumber"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              placeholder="BA106"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cost">Cost (Optional)</Label>
            <Input
              id="cost"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="1500"
              type="number"
              step="0.01"
              min="0"
              className={errors.cost ? "border-destructive" : ""}
            />
            {errors.cost && <p className="text-sm text-destructive">{errors.cost}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencyOptions.map((curr) => (
                  <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {ticketStatuses.map((statusOption) => (
                  <SelectItem key={statusOption} value={statusOption}>{statusOption}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional information about the ticket..."
            rows={3}
          />
        </div>
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {ticket ? "Update Ticket" : "Add Ticket"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TicketForm;
