import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Search, Loader2, Edit, Trash2, FileUp, FileText, Filter, X, Calendar } from "lucide-react";
import { format } from "date-fns";
import { employeeService } from "@/services/employeeService";
import { passportService } from "@/services/passportService";
import { reportService } from "@/services/reportService";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import EmployeeForm from "./EmployeeForm";
import EmployeeUploadForm from "../upload/EmployeeUploadForm";
import type { Employee, Passport } from "@/types";

interface EmployeeListProps {
  showAddButton?: boolean;
}

// Schema for the report form
const reportFormSchema = z.object({
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
  format: z.enum(['pdf', 'json']),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

const EmployeeList = ({ showAddButton = true }: EmployeeListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [passports, setPassports] = useState<Passport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [filters, setFilters] = useState({
    department: "all",
    nationality: "all",
    position: "all"
  });
  const { toast } = useToast();

  const reportForm = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      dateRange: {
        from: new Date(),
        to: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Default to one month range
      },
      format: 'pdf',
    },
  });
  
  const fetchData = async () => {
    try {
      setLoading(true);
      const employeeData = await employeeService.getAll();
      setEmployees(employeeData);
      const passportData = await passportService.getAll();
      setPassports(passportData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching employee data:", err);
      setError("Failed to load employee data. Please try again later.");
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);

  // Get unique departments, positions, and nationalities for filters
  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];
  const positions = [...new Set(employees.map(e => e.position).filter(Boolean))];
  const nationalities = [...new Set(employees.map(e => e.nationality).filter(Boolean))];
  
  const filteredEmployees = employees.filter(employee => {
    // Text search filter
    const matchesSearch = 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.department && employee.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (employee.position && employee.position.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (employee.nationality && employee.nationality.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Dropdown filters
    const matchesDepartment = filters.department === "all" || employee.department === filters.department;
    const matchesPosition = filters.position === "all" || employee.position === filters.position;
    const matchesNationality = filters.nationality === "all" || employee.nationality === filters.nationality;
    
    return matchesSearch && matchesDepartment && matchesPosition && matchesNationality;
  });

  const clearFilters = () => {
    setFilters({
      department: "all",
      nationality: "all",
      position: "all"
    });
  };
  
  const getEmployeePassport = (employeeId: string) => {
    return passports.find(passport => passport.employee_id === employeeId);
  };
  
  const handleViewEmployeeDetails = (id: string) => {
    navigate(`/employee/${id}`);
  };

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setIsFormOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsFormOpen(true);
  };

  const handleDeleteEmployee = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteEmployee = async () => {
    if (!employeeToDelete) return;

    try {
      await employeeService.delete(employeeToDelete.id);
      toast({
        title: "Employee Deleted",
        description: `${employeeToDelete.name} has been deleted successfully.`,
      });
      fetchData();
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast({
        title: "Error",
        description: "Failed to delete employee. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const handleFormSubmit = async (data: Omit<Employee, 'id'>) => {
    try {
      if (selectedEmployee) {
        await employeeService.update(selectedEmployee.id, data);
        toast({
          title: "Employee Updated",
          description: `${data.name}'s information has been updated successfully.`,
        });
      } else {
        const employeeId = `EMP${Math.floor(Math.random() * 9000) + 1000}`;
        const newEmployeeData = {
          ...data, 
          id: employeeId
        };
        await employeeService.create(newEmployeeData);
        toast({
          title: "Employee Added",
          description: `${data.name} has been added successfully.`,
        });
      }
      setIsFormOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving employee:", error);
      toast({
        title: "Error",
        description: "Failed to save employee data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUploadFile = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsUploadDialogOpen(true);
  };

  const handleUploadSuccess = () => {
    toast({
      title: "File Uploaded",
      description: `File has been uploaded successfully for ${selectedEmployee?.name}.`,
    });
    setIsUploadDialogOpen(false);
  };

  const handleGenerateReport = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsReportDialogOpen(true);
  };

  const downloadEmployeeReport = async (values: ReportFormValues) => {
    if (!selectedEmployee) return;

    setIsGeneratingReport(true);
    try {
      const { dateRange, format } = values;
      await reportService.downloadEmployeeReport({
        employeeId: selectedEmployee.id,
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString(),
        format: format
      });
      
      toast({
        title: "Report Generated",
        description: `${selectedEmployee.name}'s report has been generated and downloaded.`,
      });
      setIsReportDialogOpen(false);
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <User className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Employees</h2>
        </div>
        {showAddButton && (
          <Button onClick={handleAddEmployee}>Add Employee</Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 items-center pb-4">
        <div className="flex-1 min-w-[260px] flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees by name, ID, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>

        <Popover open={filterMenuOpen} onOpenChange={setFilterMenuOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="min-w-[120px]">
              <Filter className="h-3.5 w-3.5 mr-2" />
              <span>Filter</span>
              {Object.values(filters).some(value => value !== "all") && (
                <Badge variant="secondary" className="ml-2 bg-primary text-white">
                  {Object.values(filters).filter(value => value !== "all").length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              <h4 className="font-medium leading-none">Filter Employees</h4>
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium">Department</label>
                  <Select 
                    value={filters.department} 
                    onValueChange={(value) => setFilters({...filters, department: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Position</label>
                  <Select 
                    value={filters.position} 
                    onValueChange={(value) => setFilters({...filters, position: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Positions</SelectItem>
                      {positions.map((pos) => (
                        <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Nationality</label>
                  <Select 
                    value={filters.nationality} 
                    onValueChange={(value) => setFilters({...filters, nationality: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select nationality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Nationalities</SelectItem>
                      {nationalities.map((nat) => (
                        <SelectItem key={nat} value={nat}>{nat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {Object.values(filters).some(value => value !== "all") && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2" 
                    onClick={clearFilters}
                  >
                    <X className="h-3.5 w-3.5 mr-2" />
                    Clear filters
                  </Button>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {Object.values(filters).some(value => value !== "all") && (
        <div className="flex items-center flex-wrap gap-2 pb-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.department !== "all" && (
            <Badge variant="outline" className="flex items-center gap-1">
              Department: {filters.department}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({...filters, department: "all"})} />
            </Badge>
          )}
          {filters.position !== "all" && (
            <Badge variant="outline" className="flex items-center gap-1">
              Position: {filters.position}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({...filters, position: "all"})} />
            </Badge>
          )}
          {filters.nationality !== "all" && (
            <Badge variant="outline" className="flex items-center gap-1">
              Nationality: {filters.nationality}
              <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({...filters, nationality: "all"})} />
            </Badge>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading employee data...</span>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Email / Phone</TableHead>
                <TableHead>Nationality</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No employees found
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => {
                  return (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.id}</TableCell>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>{employee.department || "N/A"}</TableCell>
                      <TableCell>{employee.position || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{employee.email || "N/A"}</span>
                          {employee.phone && <span className="text-muted-foreground text-xs">{employee.phone}</span>}
                        </div>
                      </TableCell>
                      <TableCell>{employee.nationality || "N/A"}</TableCell>
                      <TableCell>
                        {employee.join_date ? format(new Date(employee.join_date), "MMM d, yyyy") : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex space-x-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewEmployeeDetails(employee.id)}
                          >
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditEmployee(employee)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm" 
                            onClick={() => handleUploadFile(employee)}
                          >
                            <FileUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGenerateReport(employee)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteEmployee(employee)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogTitle>
            {selectedEmployee ? "Edit Employee" : "Add New Employee"}
          </DialogTitle>
          <DialogDescription>
            {selectedEmployee 
              ? "Update employee information in the system."
              : "Add a new employee to the system."}
          </DialogDescription>
          <EmployeeForm 
            employee={selectedEmployee} 
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogDescription>
            Upload documents for {selectedEmployee?.name}.
          </DialogDescription>
          {selectedEmployee && (
            <EmployeeUploadForm 
              employeeId={selectedEmployee.id} 
              onSuccess={handleUploadSuccess}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogTitle>Generate Employee Report</DialogTitle>
          <DialogDescription>
            Create a report for {selectedEmployee?.name} for the selected date range.
          </DialogDescription>
          <Form {...reportForm}>
            <form onSubmit={reportForm.handleSubmit(downloadEmployeeReport)} className="space-y-4">
              <FormField
                control={reportForm.control}
                name="dateRange"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date Range</FormLabel>
                    <FormControl>
                      <DatePickerWithRange 
                        dateRange={field.value} 
                        onDateRangeChange={(range: DateRange) => field.onChange(range)} 
                      />
                    </FormControl>
                    <FormDescription>
                      Select the time period for the report
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={reportForm.control}
                name="format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Report Format</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the format for the downloaded report
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsReportDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isGeneratingReport}>
                  {isGeneratingReport ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Download Report
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this employee?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete {employeeToDelete?.name}'s
              record and all associated data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteEmployee} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EmployeeList;
