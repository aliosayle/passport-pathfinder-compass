import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, addDays, parse } from 'date-fns';
import { CalendarIcon, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import employeeVisaService, { EmployeeVisa } from '@/services/employeeVisaService';
import { visaTypeService, VisaType } from '@/services/visaTypeService';
import { employeeService, Employee } from '@/services/employeeService';

interface EmployeeVisaFormProps {
  onSuccess: () => void;
  initialData?: EmployeeVisa;
  employeeId?: string;
}

const EmployeeVisaForm: React.FC<EmployeeVisaFormProps> = ({ onSuccess, initialData, employeeId }) => {
  const [visaTypes, setVisaTypes] = useState<VisaType[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issueDate, setIssueDate] = useState<Date | undefined>(
    initialData?.issue_date ? new Date(initialData.issue_date) : undefined
  );
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(
    initialData?.expiry_date ? new Date(initialData.expiry_date) : undefined
  );
  const [selectedVisaTypeId, setSelectedVisaTypeId] = useState<string | undefined>(
    initialData?.visa_type_id
  );
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeDropdownOpen, setEmployeeDropdownOpen] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors }, control, reset, watch } = useForm<Partial<EmployeeVisa>>({
    defaultValues: initialData || { 
      employee_id: employeeId,
      status: 'Valid'
    }
  });

  // Filter employees based on search term
  const filteredEmployees = employees;
  
  // We'll let the Command component handle filtering through its built-in filter
  const filterEmployee = (value: string, search: string) => {
    return value.toLowerCase().includes(search.toLowerCase());
  };

  useEffect(() => {
    const fetchVisaTypes = async () => {
      try {
        const data = await visaTypeService.getAll();
        setVisaTypes(data);
      } catch (error) {
        console.error('Error fetching visa types:', error);
      }
    };

    const fetchEmployees = async () => {
      try {
        const data = await employeeService.getAll();
        setEmployees(data);

        // If initialData has employee_id, find and set the selected employee
        if (initialData?.employee_id) {
          const selectedEmployee = data.find(emp => emp.id === initialData.employee_id);
          if (selectedEmployee) {
            setSelectedEmployee(selectedEmployee);
          }
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchVisaTypes();
    if (!employeeId) {
      fetchEmployees();
    } else {
      // If employeeId is provided, fetch that employee's details
      const fetchEmployeeDetails = async () => {
        try {
          const employee = await employeeService.getById(employeeId);
          setSelectedEmployee(employee);
        } catch (error) {
          console.error('Error fetching employee details:', error);
        }
      };
      fetchEmployeeDetails();
    }

    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset, employeeId]);

  // Calculate expiry date based on visa type and issue date
  const calculateExpiryDate = (visaTypeId: string, issueDate?: Date) => {
    if (!issueDate || !visaTypeId) return;
    
    const visaType = visaTypes.find(vt => vt.id === visaTypeId);
    if (!visaType) return;

    // Parse the duration (expected format like "30 days", "6 months", "1 year")
    const durationStr = visaType.duration.toLowerCase();
    let daysToAdd = 0;

    if (durationStr.includes('day')) {
      // Extract number of days
      const days = parseInt(durationStr.match(/\d+/)?.[0] || '0');
      daysToAdd = days;
    } else if (durationStr.includes('month')) {
      // Approximate months as 30 days
      const months = parseInt(durationStr.match(/\d+/)?.[0] || '0');
      daysToAdd = months * 30;
    } else if (durationStr.includes('year')) {
      // Approximate years as 365 days
      const years = parseInt(durationStr.match(/\d+/)?.[0] || '0');
      daysToAdd = years * 365;
    }

    if (daysToAdd > 0) {
      const newExpiryDate = addDays(issueDate, daysToAdd);
      setExpiryDate(newExpiryDate);
      setValue('expiry_date', format(newExpiryDate, 'yyyy-MM-dd'));
    }
  };

  useEffect(() => {
    // When visa type or issue date changes, recalculate expiry date
    if (selectedVisaTypeId && issueDate) {
      calculateExpiryDate(selectedVisaTypeId, issueDate);
    }
  }, [selectedVisaTypeId, issueDate]);

  const onSubmit = async (data: Partial<EmployeeVisa>) => {
    try {
      setIsSubmitting(true);
      
      // Add the formatted dates from the date pickers
      if (issueDate) {
        data.issue_date = format(issueDate, 'yyyy-MM-dd');
      }
      if (expiryDate) {
        data.expiry_date = format(expiryDate, 'yyyy-MM-dd');
      }
      
      if (initialData?.id) {
        // Update existing visa
        await employeeVisaService.update(initialData.id, data);
      } else {
        // Create new visa
        await employeeVisaService.create(data as Omit<EmployeeVisa, 'id'>);
      }
      
      // Reset form and notify parent component
      reset();
      setIssueDate(undefined);
      setExpiryDate(undefined);
      onSuccess();
    } catch (error) {
      console.error('Error submitting employee visa:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Update Visa' : 'Add New Visa'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* Employee Selection - Only show if not tied to a specific employee */}
          {!employeeId && (
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="employee_id">Employee</label>
              <Popover open={employeeDropdownOpen} onOpenChange={setEmployeeDropdownOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={employeeDropdownOpen}
                    className="w-full justify-between font-normal"
                  >
                    {selectedEmployee ? (
                      <span>{selectedEmployee.name} ({selectedEmployee.id})</span>
                    ) : (
                      <span>Select employee...</span>
                    )}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command filter={filterEmployee}>
                    <CommandInput placeholder="Search employee..." />
                    <CommandList>
                      <CommandEmpty>No employee found.</CommandEmpty>
                      <CommandGroup heading="Employees">
                        <ScrollArea className="h-60">
                          {employees.map((employee) => (
                            <CommandItem
                              key={employee.id}
                              value={`${employee.name.toLowerCase()} ${employee.id.toLowerCase()}`}
                              onSelect={() => {
                                setSelectedEmployee(employee);
                                setValue('employee_id', employee.id);
                                setEmployeeDropdownOpen(false);
                              }}
                            >
                              <div className="flex flex-col">
                                <span>{employee.name}</span>
                                <span className="text-xs text-muted-foreground">ID: {employee.id}</span>
                              </div>
                              {employee.department && (
                                <Badge variant="outline" className="ml-auto">
                                  {employee.department}
                                </Badge>
                              )}
                            </CommandItem>
                          ))}
                        </ScrollArea>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.employee_id && <p className="text-sm text-red-500">Employee is required</p>}
            </div>
          )}
          
          {/* Visa Type Selection */}
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="visa_type_id">Visa Type</label>
            <Select
              defaultValue={initialData?.visa_type_id}
              onValueChange={(value) => {
                setValue('visa_type_id', value);
                setSelectedVisaTypeId(value);
                // If issue date is already set, calculate expiry date
                if (issueDate) {
                  calculateExpiryDate(value, issueDate);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Visa Type" />
              </SelectTrigger>
              <SelectContent>
                {visaTypes.map((visaType) => (
                  <SelectItem key={visaType.id} value={visaType.id}>
                    {visaType.type} - {visaType.country_name} ({visaType.duration})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.visa_type_id && <p className="text-sm text-red-500">Visa type is required</p>}
            {selectedVisaTypeId && (
              <p className="text-xs text-muted-foreground mt-1">
                {visaTypes.find(vt => vt.id === selectedVisaTypeId)?.duration}
              </p>
            )}
          </div>
          
          {/* Document Number */}
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="document_number">Document Number</label>
            <Input
              id="document_number"
              placeholder="Enter visa document number"
              {...register('document_number')}
            />
          </div>
          
          {/* Issue Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Issue Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {issueDate ? format(issueDate, 'PPP') : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={issueDate}
                  onSelect={(date) => {
                    if (date) {
                      setIssueDate(date);
                      setValue('issue_date', format(date, 'yyyy-MM-dd'));
                      
                      // If visa type is already selected, calculate expiry date
                      if (selectedVisaTypeId) {
                        calculateExpiryDate(selectedVisaTypeId, date);
                      }
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.issue_date && <p className="text-sm text-red-500">Issue date is required</p>}
          </div>
          
          {/* Expiry Date */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Expiry Date</label>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiryDate ? format(expiryDate, 'PPP') : <span>Select date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={expiryDate}
                    onSelect={(date) => {
                      setExpiryDate(date);
                      if (date) {
                        setValue('expiry_date', format(date, 'yyyy-MM-dd'));
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            {issueDate && selectedVisaTypeId && (
              <p className="text-xs text-muted-foreground mt-1">
                Auto-calculated based on visa type duration.
              </p>
            )}
            {errors.expiry_date && <p className="text-sm text-red-500">Expiry date is required</p>}
          </div>
          
          {/* Status */}
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="status">Status</label>
            <Select
              defaultValue={initialData?.status || 'Valid'}
              onValueChange={(value) => setValue('status', value as EmployeeVisa['status'])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Valid">Valid</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
                <SelectItem value="Processing">Processing</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Notes */}
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="notes">Notes</label>
            <Textarea
              id="notes"
              placeholder="Enter any additional notes"
              {...register('notes')}
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => onSuccess()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : initialData ? 'Update Visa' : 'Add Visa'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default EmployeeVisaForm;