
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
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Passport, PassportStatus } from "@/types";
import { useState } from "react";
import { standardStatuses } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

interface PassportFormProps {
  passport?: Passport;
  onSubmit: (data: Omit<Passport, 'id' | 'lastUpdated'>) => void;
  onCancel: () => void;
}

const formSchema = z.object({
  employeeName: z.string().min(2, "Employee name is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
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
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: passport ? {
      employeeName: passport.employeeName,
      employeeId: passport.employeeId,
      passportNumber: passport.passportNumber,
      nationality: passport.nationality,
      issueDate: passport.issueDate,
      expiryDate: passport.expiryDate,
      status: standardStatuses.includes(passport.status) ? passport.status : "custom",
      ticketReference: passport.ticketReference || "",
      notes: passport.notes || "",
    } : {
      employeeName: "",
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
    
    onSubmit({
      ...values,
      status: finalStatus
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
                name="employeeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee ID</FormLabel>
                    <FormControl>
                      <Input placeholder="EMP001" {...field} />
                    </FormControl>
                    <FormMessage />
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
                    <FormControl>
                      <Input placeholder="United Kingdom" {...field} />
                    </FormControl>
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
