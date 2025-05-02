
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllPassportsSortedByExpiry, getExpiryStatusColor } from "@/lib/data";
import StatusBadge from "@/components/ui/StatusBadge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Passport } from "@/types";
import { useState } from "react";

interface PassportListProps {
  onSelect?: (passport: Passport) => void;
  onEdit?: (passport: Passport) => void;
}

const PassportList = ({ onSelect, onEdit }: PassportListProps) => {
  const [filter, setFilter] = useState("all");
  const allPassports = getAllPassportsSortedByExpiry();

  const filteredPassports = filter === "all" 
    ? allPassports 
    : allPassports.filter(p => {
        if (filter === "expiring-30") {
          const today = new Date();
          const futureDate = new Date(today);
          futureDate.setDate(today.getDate() + 30);
          return p.expiryDate >= today && p.expiryDate <= futureDate;
        }
        if (filter === "expiring-90") {
          const today = new Date();
          const futureDate = new Date(today);
          futureDate.setDate(today.getDate() + 90);
          return p.expiryDate >= today && p.expiryDate <= futureDate;
        }
        return p.status === filter;
      });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button 
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
          className="text-sm"
        >
          All
        </Button>
        <Button 
          variant={filter === "expiring-30" ? "default" : "outline"}
          onClick={() => setFilter("expiring-30")}
          className="text-sm"
        >
          Expiring in 30 Days
        </Button>
        <Button 
          variant={filter === "expiring-90" ? "default" : "outline"}
          onClick={() => setFilter("expiring-90")}
          className="text-sm"
        >
          Expiring in 90 Days
        </Button>
        <Button 
          variant={filter === "With Company" ? "default" : "outline"}
          onClick={() => setFilter("With Company")}
          className="text-sm"
        >
          With Company
        </Button>
        <Button 
          variant={filter === "With Employee" ? "default" : "outline"}
          onClick={() => setFilter("With Employee")}
          className="text-sm"
        >
          With Employee
        </Button>
        <Button 
          variant={filter === "With DGM" ? "default" : "outline"}
          onClick={() => setFilter("With DGM")}
          className="text-sm"
        >
          With DGM
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Passport Number</TableHead>
              <TableHead>Nationality</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPassports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  No passports found matching the selected filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredPassports.map((passport) => {
                const expiryClass = getExpiryStatusColor(passport.expiryDate);
                
                return (
                  <TableRow key={passport.id}>
                    <TableCell className="font-medium">{passport.employeeName}</TableCell>
                    <TableCell>{passport.employeeId}</TableCell>
                    <TableCell>{passport.passportNumber}</TableCell>
                    <TableCell>{passport.nationality}</TableCell>
                    <TableCell className={`text-${expiryClass}`}>
                      {format(passport.expiryDate, "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={passport.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {onSelect && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => onSelect(passport)}
                          >
                            View
                          </Button>
                        )}
                        {onEdit && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => onEdit(passport)}
                          >
                            Edit
                          </Button>
                        )}
                      </div>
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

export default PassportList;
