import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Search, Loader2, Edit, Trash2, FileUp } from "lucide-react";
import { format } from "date-fns";
import { employeeService } from "@/services/employeeService";
import { passportService } from "@/services/passportService";
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
import { useToast } from "@/hooks/use-toast";
import EmployeeForm from "./EmployeeForm";
import EmployeeUploadForm from "../upload/EmployeeUploadForm";
import type { Employee, Passport } from "@/types";

interface EmployeeListProps {
  showAddButton?: boolean;
}

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
  const { toast } = useToast();
  
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
  
  const filteredEmployees = employees.filter(employee => 
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employee.department && employee.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (employee.position && employee.position.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (employee.nationality && employee.nationality.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
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

      <div className="flex items-center space-x-2 pb-4">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search employees by name, ID, department, nationality..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

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
