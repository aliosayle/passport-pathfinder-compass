import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Passport, PassportStatus, Employee } from "@/types";
import { useState, useEffect } from "react";
import { standardStatuses } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { employeeService } from "@/services/employeeService";
import { passportService } from "@/services/passportService";
import { nationalityService, Nationality } from "@/services/nationalityService";

interface PassportFormProps {
  passport?: Passport;
  onSubmit: (data: Omit<Passport, 'id' | 'lastUpdated'>) => void;
  onCancel: () => void;
}

const formSchema = z.object({
  employeeId: z.string().min(1, "Employee selection is required"),
  passportNumber: z.string().min(1, "Passport number is required"),
  nationality: z.string().min(1, "Nationality is required"),
  issueDate: z.date({ required_error: "Issue date is required" }),
  expiryDate: z.date({ required_error: "Expiry date is required" }),
  status: z.string().min(1, "Status is required"),
  ticketReference: z.string().optional(),
  notes: z.string().optional(),
});

const PassportForm = ({ passport, onSubmit, onCancel }: PassportFormProps) => {
  const [customStatus, setCustomStatus] = useState("");
  const [showCustomStatus, setShowCustomStatus] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [nationalities, setNationalities] = useState<Nationality[]>([]);
  const [loadingNationalities, setLoadingNationalities] = useState(false);
  const { toast } = useToast();
  
  // Fetch nationalities for dropdown
  useEffect(() => {
    const fetchNationalities = async () => {
      try {
        setLoadingNationalities(true);
        const data = await nationalityService.getAll();
        setNationalities(data);
        setLoadingNationalities(false);
      } catch (error) {
        console.error("Error fetching nationalities:", error);
        setLoadingNationalities(false);
      }
    };
    
    fetchNationalities();
  }, []);
  
  // Fetch employees for dropdown
  useEffect(() => {
    const fetchEmployeesAndPassports = async () => {
      try {
        setLoadingEmployees(true);
        
        // Get all employees
        const employeeData = await employeeService.getAll();
        setEmployees(employeeData);
        
        // Get all passports to filter out employees who already have passports
        const passportData = await passportService.getAll();
        
        // Create a Set of employee IDs who already have passports
        const employeeIdsWithPassports = new Set(
          passportData.map((p: Passport) => p.employee_id || p.employeeId)
        );
        
        // Filter out employees who already have passports, except the current one being edited
        const filteredEmployees = employeeData.filter(emp => {
          // If editing a passport, allow its employee to show in the dropdown
          if (passport && (passport.employeeId === emp.id || passport.employee_id === emp.id)) {
            return true;
          }
          // Otherwise filter out employees who already have passports
          return !employeeIdsWithPassports.has(emp.id);
        });
        
        setAvailableEmployees(filteredEmployees);
        setLoadingEmployees(false);
        
        // If editing existing passport, set the selected employee
        if (passport) {
          const matchingEmployee = employeeData.find(
            emp => emp.id === (passport.employeeId || passport.employee_id)
          );
          if (matchingEmployee) {
            setSelectedEmployee(matchingEmployee);
          }
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
        setLoadingEmployees(false);
      }
    };
    
    fetchEmployeesAndPassports();
  }, [passport]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: passport ? {
      employeeId: passport.employeeId || passport.employee_id,
      passportNumber: passport.passportNumber || passport.passport_number,
      nationality: passport.nationality,
      issueDate: passport.issueDate ? new Date(passport.issueDate) : 
                passport.issue_date ? new Date(passport.issue_date) : undefined,
      expiryDate: passport.expiryDate ? new Date(passport.expiryDate) : 
                 passport.expiry_date ? new Date(passport.expiry_date) : undefined,
      status: standardStatuses.includes(passport.status) ? passport.status : "custom",
      ticketReference: passport.ticketReference || passport.ticket_reference || "",
      notes: passport.notes || "",
    } : {
      employeeId: "",
      passportNumber: "",
      nationality: "",
      ticketReference: "",
      notes: "",
    },
  });
  
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // Validate issue date before expiry date
    if (values.issueDate >= values.expiryDate) {
      toast({
        title: "Invalid Date Range",
        description: "Issue date must be before expiry date",
        variant: "destructive"
      });
      return;
    }
    
    // If custom status is selected, use the entered custom status
    const finalStatus: PassportStatus = values.status === "custom" ? customStatus : values.status;
    
    // If custom status was selected but not entered
    if (values.status === "custom" && !customStatus.trim()) {
      toast({
        title: "Missing Custom Status",
        description: "Please enter a custom status value",
        variant: "destructive"
      });
      return;
    }
    
    // Get the employee name from the selected ID
    const employee = employees.find(emp => emp.id === values.employeeId);
    if (!employee) {
      toast({
        title: "Invalid Employee",
        description: "Please select a valid employee",
        variant: "destructive"
      });
      return;
    }
    
    // Submit with both employee ID and name
    onSubmit({
      employeeName: employee.name,
      employeeId: values.employeeId,
      passportNumber: values.passportNumber,
      nationality: values.nationality,
      issueDate: values.issueDate,
      expiryDate: values.expiryDate,
      status: finalStatus,
      ticketReference: values.ticketReference,
      notes: values.notes
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{passport ? "Edit Passport" : "Add New Passport"}</CardTitle>
        <CardDescription>
          {passport 
            ? "Update the passport information for this employee" 
            : "Enter the passport details for a new employee"
          }
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        const employee = employees.find(emp => emp.id === value);
                        if (employee) {
                          setSelectedEmployee(employee);
                        }
                      }}
                      value={field.value}
                      disabled={loadingEmployees}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={loadingEmployees ? "Loading employees..." : "Select employee"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loadingEmployees ? (
                          <div className="flex items-center justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span>Loading employees...</span>
                          </div>
                        ) : availableEmployees.length === 0 ? (
                          <div className="p-2 text-center text-muted-foreground">
                            No employees without passports available
                          </div>
                        ) : (
                          availableEmployees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.name} ({employee.id})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    {selectedEmployee && (
                      <FormDescription>
                        ID: {selectedEmployee.id} • Department: {selectedEmployee.department || "Not specified"}
                      </FormDescription>
                    )}
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="passportNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passport Number</FormLabel>
                    <FormControl>
                      <Input placeholder="A1234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="nationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nationality</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loadingNationalities}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={loadingNationalities ? "Loading nationalities..." : "Select nationality"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loadingNationalities ? (
                          <div className="flex items-center justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span>Loading nationalities...</span>
                          </div>
                        ) : nationalities.length === 0 ? (
                          <div className="p-2 text-center text-muted-foreground">
                            No nationalities available
                          </div>
                        ) : (
                          nationalities.map((nationality) => (
                            <SelectItem key={nationality.id} value={nationality.name}>
                              {nationality.name} ({nationality.code})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
                              format(field.value, "PP")
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
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Expiry Date</FormLabel>
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
                              format(field.value, "PP")
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
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setShowCustomStatus(value === "custom");
                        if (value !== "custom") {
                          setCustomStatus("");
                        } else if (passport && !standardStatuses.includes(passport.status)) {
                          setCustomStatus(passport.status);
                        }
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select passport status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {standardStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">Custom Status...</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {showCustomStatus && (
                <FormItem>
                  <FormLabel>Custom Status</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter custom status"
                      value={customStatus}
                      onChange={(e) => setCustomStatus(e.target.value)}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter a custom location or status for the passport
                  </FormDescription>
                </FormItem>
              )}
              
              <FormField
                control={form.control}
                name="ticketReference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ticket Reference</FormLabel>
                    <FormControl>
                      <Input placeholder="T12345 (Optional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes about this passport (Optional)"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">{passport ? "Update" : "Submit"}</Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default PassportForm;
