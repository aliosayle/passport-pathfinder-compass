
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAllEmployees, getEmployeePassport, getExpiryStatusColor } from "@/lib/data";
import { User, Search, FileText } from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { format } from "date-fns";

const EmployeeList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  
  const employees = getAllEmployees();
  
  const filteredEmployees = employees.filter(employee => 
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employee.department && employee.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (employee.position && employee.position.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (employee.nationality && employee.nationality.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const handleViewEmployeeDetails = (id: string) => {
    navigate(`/employee/${id}`);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <User className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Employees & Passports</h2>
        </div>
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Passport Number</TableHead>
              <TableHead>Passport Status</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No employees found
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((employee) => {
                const passport = getEmployeePassport(employee.id);
                const expiryClass = passport ? getExpiryStatusColor(passport.expiryDate) : "";
                
                return (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.id}</TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.department || "N/A"}</TableCell>
                    <TableCell>
                      {passport ? (
                        <div className="flex items-center space-x-1">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span>{passport.passportNumber}</span>
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      {passport ? (
                        <StatusBadge status={passport.status} />
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      {passport ? (
                        <span className={`text-${expiryClass}`}>
                          {format(passport.expiryDate, "MMM d, yyyy")}
                        </span>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewEmployeeDetails(employee.id)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default EmployeeList;
