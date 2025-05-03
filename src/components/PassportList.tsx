import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getExpiryStatusColor } from "@/lib/utils";
import StatusBadge from "@/components/ui/StatusBadge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { type Passport } from "@/types";
import { useState, useEffect } from "react";
import { passportService } from "@/services/passportService";
import { Loader2 } from "lucide-react";
import { differenceInDays } from "date-fns";

interface PassportListProps {
  onSelect?: (passport: Passport) => void;
  onEdit?: (passport: Passport) => void;
}

const PassportList = ({ onSelect, onEdit }: PassportListProps) => {
  const [filter, setFilter] = useState("all");
  const [passports, setPassports] = useState<Passport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPassports = async () => {
      try {
        setLoading(true);
        const data = await passportService.getAll();
        // Sort by expiry date (ascending)
        const sortedPassports = [...data].sort((a, b) => 
          new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
        );
        setPassports(sortedPassports);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching passports:", err);
        setError("Failed to load passport data");
        setLoading(false);
      }
    };

    fetchPassports();
  }, []);

  const filteredPassports = filter === "all" 
    ? passports 
    : passports.filter(p => {
        if (filter === "expiring-30") {
          const today = new Date();
          const expiryDate = new Date(p.expiry_date);
          return differenceInDays(expiryDate, today) <= 30 && differenceInDays(expiryDate, today) >= 0;
        }
        if (filter === "expiring-90") {
          const today = new Date();
          const expiryDate = new Date(p.expiry_date);
          return differenceInDays(expiryDate, today) <= 90 && differenceInDays(expiryDate, today) >= 0;
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
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading passport data...</span>
        </div>
      ) : (
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
                  const expiryClass = getExpiryStatusColor(new Date(passport.expiry_date));
                  
                  return (
                    <TableRow key={passport.id}>
                      <TableCell className="font-medium">{passport.employee_name}</TableCell>
                      <TableCell>{passport.employee_id}</TableCell>
                      <TableCell>{passport.passport_number}</TableCell>
                      <TableCell>{passport.nationality}</TableCell>
                      <TableCell className={`text-${expiryClass}`}>
                        {format(new Date(passport.expiry_date), "MMM d, yyyy")}
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
      )}
    </div>
  );
};

export default PassportList;
