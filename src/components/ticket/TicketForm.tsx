import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, parseISO } from "date-fns";
import { Ticket, TicketType } from "@/services/ticketService";
import { employeeService } from "@/services/employeeService";
import { airlineService } from "@/services/airlineService";
import { ticketService } from "@/services/ticketService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Plane } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

// Define the ticket types
const ticketTypes: TicketType[] = [
  "Business", 
  "Vacation", 
  "Sick Leave", 
  "Family Emergency", 
  "Training"
];

// Form schema for validation
const ticketFormSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  employeeName: z.string().min(1, "Employee name is required"),
  airlineId: z.string().min(1, "Airline is required"),
  airlineName: z.string().min(1, "Airline name is required"),
  reference: z.string().optional(),
  origin: z.string().min(1, "Origin is required"),
  destination: z.string().min(1, "Destination is required"),
  departureDate: z.date({ required_error: "Departure date is required" }),
  returnDate: z.date().optional(),
  cost: z.coerce.number().optional(),
  currency: z.string().default("USD"),
  flightNumber: z.string().optional(),
  type: z.string().min(1, "Type is required"),
  notes: z.string().optional(),
  issueDate: z.date().optional(),
});

type TicketFormValues = z.infer<typeof ticketFormSchema>;

interface TicketFormProps {
  ticket?: Ticket;
  onSave: () => void;
  onClose: () => void;
}

const TicketForm = ({ ticket, onSave, onClose }: TicketFormProps) => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [airlines, setAirlines] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Initialize form with default values or existing ticket data
  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      employeeId: ticket?.employee_id || ticket?.employeeId || "",
      employeeName: ticket?.employee_name || ticket?.employeeName || "",
      airlineId: ticket?.airline_id || ticket?.airlineId || "",
      airlineName: ticket?.airline_name || ticket?.airlineName || "",
      reference: ticket?.reference || "",
      origin: ticket?.origin || "",
      destination: ticket?.destination || "",
      departureDate: ticket?.departure_date 
        ? parseISO(ticket.departure_date as string) 
        : ticket?.departureDate 
          ? new Date(ticket.departureDate) 
          : new Date(),
      returnDate: ticket?.return_date 
        ? parseISO(ticket.return_date as string) 
        : ticket?.returnDate 
          ? new Date(ticket.returnDate) 
          : undefined,
      cost: ticket?.cost || undefined,
      currency: ticket?.currency || "USD",
      flightNumber: ticket?.flight_number || ticket?.flightNumber || "",
      type: ticket?.type || "Business",
      notes: ticket?.notes || "",
      issueDate: ticket?.issue_date 
        ? parseISO(ticket.issue_date as string) 
        : ticket?.issueDate 
          ? new Date(ticket.issueDate) 
          : new Date(),
    },
  });

  // Load employees and airlines for dropdowns
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await employeeService.getAll();
        setEmployees(data);
      } catch (error) {
        console.error("Error fetching employees:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load employees. Please try again.",
        });
      }
    };

    const fetchAirlines = async () => {
      try {
        const data = await airlineService.getAll();
        setAirlines(data);
      } catch (error) {
        console.error("Error fetching airlines:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load airlines. Please try again.",
        });
      }
    };

    fetchEmployees();
    fetchAirlines();
  }, [toast]);

  // Handle form submission
  const onSubmit = async (data: TicketFormValues) => {
    try {
      setIsSubmitting(true);
      
      const formattedData = {
        employee_id: data.employeeId,
        employee_name: data.employeeName,
        airline_id: data.airlineId,
        airline_name: data.airlineName,
        reference: data.reference || ticketService.generateTicketReference(),
        origin: data.origin,
        destination: data.destination,
        departure_date: format(data.departureDate, "yyyy-MM-dd"),
        return_date: data.returnDate ? format(data.returnDate, "yyyy-MM-dd") : undefined,
        cost: data.cost,
        currency: data.currency,
        flight_number: data.flightNumber,
        status: ticket?.status || "Pending",
        type: data.type,
        notes: data.notes,
        issue_date: data.issueDate ? format(data.issueDate, "yyyy-MM-dd") : undefined,
        has_return: !!data.returnDate,
        departure_completed: ticket?.departure_completed || false,
        return_completed: ticket?.return_completed || false
      };
      
      if (ticket) {
        await ticketService.update(ticket.id, formattedData);
        toast({
          title: "Ticket Updated",
          description: "Ticket has been updated successfully.",
        });
      } else {
        await ticketService.create(formattedData);
        toast({
          title: "Ticket Created",
          description: "Ticket has been created successfully.",
        });
      }
      
      onSave();
    } catch (error) {
      console.error("Error saving ticket:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save ticket. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle employee selection
  const handleEmployeeChange = (employeeId: string) => {
    const selectedEmployee = employees.find((emp) => emp.id === employeeId);
    if (selectedEmployee) {
      form.setValue("employeeId", selectedEmployee.id);
      form.setValue("employeeName", selectedEmployee.name);
    }
  };
  
  // Handle airline selection
  const handleAirlineChange = (airlineId: string) => {
    const selectedAirline = airlines.find((airline) => airline.id === airlineId);
    if (selectedAirline) {
      form.setValue("airlineId", selectedAirline.id);
      form.setValue("airlineName", selectedAirline.name);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">
            {ticket ? "Edit Ticket" : "Create New Ticket"}
          </h2>
          <p className="text-muted-foreground">
            {ticket ? "Update ticket details" : "Enter the ticket details"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Employee Information */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Employee Information</h3>
              <p className="text-sm text-muted-foreground">
                Select the employee for this ticket
              </p>
            </div>

            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={handleEmployeeChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Ticket Type and Reference */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Ticket Details</h3>
              <p className="text-sm text-muted-foreground">
                Enter basic ticket information
              </p>
            </div>

            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Auto-generated if left blank"
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Leave blank to auto-generate
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose of Travel</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select purpose" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ticketTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Flight Information */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Flight Information</h3>
            <p className="text-sm text-muted-foreground">
              Enter flight details and travel dates
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="airlineId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Airline</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={handleAirlineChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select airline" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {airlines.map((airline) => (
                        <SelectItem key={airline.id} value={airline.id}>
                          {airline.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="flightNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Flight Number</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., EK123"
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="origin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Origin</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Dubai" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., London" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="departureDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Departure Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "MMMM d, yyyy")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date("2000-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="returnDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Return Date (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "MMMM d, yyyy")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        disabled={(date) => 
                          date < new Date("2000-01-01") || 
                          (form.getValues("departureDate") && date < form.getValues("departureDate"))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    For round-trip tickets. Leave blank for one-way.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Cost and Additional Information */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Additional Information</h3>
            <p className="text-sm text-muted-foreground">
              Enter cost details and notes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex space-x-4">
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Cost (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Enter amount"
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem className="w-24">
                    <FormLabel>Currency</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="AED">AED</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="issueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Issue Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "MMMM d, yyyy")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Add any additional information here"
                      className="h-24"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-1">
            {isSubmitting && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {ticket ? "Update Ticket" : "Create Ticket"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TicketForm;
