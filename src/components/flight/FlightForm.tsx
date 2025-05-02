
import { useState } from "react";
import { Flight, FlightStatus, FlightType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { addFlight, updateFlight, flightStatuses, flightTypes, airlines, tickets } from "@/lib/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlightFormProps {
  flight?: Flight;
  onClose: () => void;
}

const FlightForm = ({ flight, onClose }: FlightFormProps) => {
  const [employeeName, setEmployeeName] = useState(flight?.employeeName || "");
  const [employeeId, setEmployeeId] = useState(flight?.employeeId || "");
  const [departureDate, setDepartureDate] = useState<Date | undefined>(flight?.departureDate);
  const [returnDate, setReturnDate] = useState<Date | undefined>(flight?.returnDate);
  const [destination, setDestination] = useState(flight?.destination || "");
  const [origin, setOrigin] = useState(flight?.origin || "");
  const [airlineId, setAirlineId] = useState(flight?.airlineId || "");
  const [airlineName, setAirlineName] = useState(flight?.airlineName || "");
  const [ticketReference, setTicketReference] = useState(flight?.ticketReference || "");
  const [flightNumber, setFlightNumber] = useState(flight?.flightNumber || "");
  const [status, setStatus] = useState<FlightStatus>(flight?.status || "Pending");
  const [type, setType] = useState<FlightType>(flight?.type || "Business");
  const [notes, setNotes] = useState(flight?.notes || "");
  const [customType, setCustomType] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { toast } = useToast();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
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
    
    if (!ticketReference.trim()) {
      newErrors.ticketReference = "Ticket reference is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAirlineChange = (id: string) => {
    setAirlineId(id);
    const airline = airlines.find(a => a.id === id);
    setAirlineName(airline?.name || "");
  };

  const handleTicketChange = (reference: string) => {
    setTicketReference(reference);
    const ticket = tickets.find(t => t.reference === reference);
    if (ticket) {
      setEmployeeName(ticket.employeeName);
      setEmployeeId(ticket.employeeId);
      setDepartureDate(ticket.departureDate);
      setReturnDate(ticket.returnDate);
      setDestination(ticket.destination);
      setOrigin(ticket.origin);
      setAirlineId(ticket.airlineId);
      setAirlineName(ticket.airlineName);
      setFlightNumber(ticket.flightNumber || "");
    }
  };

  const handleTypeChange = (selectedType: string) => {
    if (selectedType === "custom") {
      // Don't change the type yet, wait for custom input
      return;
    }
    setType(selectedType as FlightType);
  };

  const handleCustomTypeSubmit = () => {
    if (customType.trim()) {
      setType(customType.trim());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    const finalType = type === "custom" ? customType : type;
    
    try {
      if (flight) {
        // Update existing
        updateFlight({
          ...flight,
          employeeName,
          employeeId,
          departureDate: departureDate!,
          returnDate,
          destination,
          origin,
          airlineId,
          airlineName,
          ticketReference,
          flightNumber: flightNumber || undefined,
          status,
          type: finalType,
          notes: notes || undefined,
        });
        toast({
          title: "Flight Updated",
          description: `Flight details for ${employeeName} have been updated successfully.`
        });
      } else {
        // Create new
        addFlight({
          employeeName,
          employeeId,
          departureDate: departureDate!,
          returnDate,
          destination,
          origin,
          airlineId,
          airlineName,
          ticketReference,
          flightNumber: flightNumber || undefined,
          status,
          type: finalType,
          notes: notes || undefined,
        });
        toast({
          title: "Flight Added",
          description: `New flight for ${employeeName} has been added successfully.`
        });
      }
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error processing the flight data.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        {flight ? "Edit Flight" : "Add New Flight"}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ticket">From Ticket</Label>
          <Select onValueChange={handleTicketChange}>
            <SelectTrigger id="ticket">
              <SelectValue placeholder="Select a ticket (optional)" />
            </SelectTrigger>
            <SelectContent>
              {tickets.map((ticket) => (
                <SelectItem key={ticket.id} value={ticket.reference}>
                  {ticket.reference} - {ticket.employeeName} ({ticket.destination})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ticketReference">Ticket Reference</Label>
            <Input
              id="ticketReference"
              value={ticketReference}
              onChange={(e) => setTicketReference(e.target.value)}
              placeholder="T12345"
              className={errors.ticketReference ? "border-destructive" : ""}
            />
            {errors.ticketReference && <p className="text-sm text-destructive">{errors.ticketReference}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as FlightStatus)}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {flightStatuses.map((statusOption) => (
                  <SelectItem key={statusOption} value={statusOption}>{statusOption}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Flight Type</Label>
            <div className="flex gap-2">
              <Select value={type === customType ? "custom" : type} onValueChange={handleTypeChange}>
                <SelectTrigger id="type" className="flex-1">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {flightTypes.map((typeOption) => (
                    <SelectItem key={typeOption} value={typeOption}>{typeOption}</SelectItem>
                  ))}
                  <SelectItem value="custom">Custom...</SelectItem>
                </SelectContent>
              </Select>
              {type !== customType && !flightTypes.includes(type) && (
                <Button type="button" variant="outline" onClick={() => setType("custom")}>
                  Edit
                </Button>
              )}
            </div>
          </div>
          
          {(type === "custom" || (type !== customType && !flightTypes.includes(type))) && (
            <div className="space-y-2">
              <Label htmlFor="customType">Custom Type</Label>
              <div className="flex gap-2">
                <Input
                  id="customType"
                  value={customType || type}
                  onChange={(e) => setCustomType(e.target.value)}
                  placeholder="Enter custom type"
                />
                <Button type="button" onClick={handleCustomTypeSubmit}>
                  Set
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional information about the flight..."
            rows={3}
          />
        </div>
        
        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {flight ? "Update Flight" : "Add Flight"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FlightForm;
