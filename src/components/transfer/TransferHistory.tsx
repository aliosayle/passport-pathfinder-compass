
import { useParams } from "react-router-dom";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { getEmployeeTransfers } from "@/lib/data";
import { User, Banknote } from "lucide-react";

const TransferHistory = () => {
  const { id } = useParams<{ id: string }>();
  const transfers = getEmployeeTransfers(id || "");
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-blue-100 text-blue-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <div className="space-y-4">
      {transfers.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Beneficiary</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers.map((transfer) => (
                <TableRow key={transfer.id}>
                  <TableCell>
                    {format(transfer.date, "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Banknote className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {transfer.currency} {transfer.amount.toLocaleString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{transfer.beneficiaryName}</div>
                      <div className="text-xs text-muted-foreground">{transfer.beneficiaryPhone}</div>
                    </div>
                  </TableCell>
                  <TableCell>{transfer.destination}</TableCell>
                  <TableCell className="max-w-xs truncate">{transfer.notes || "-"}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeClass(transfer.status)}>
                      {transfer.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-48 space-y-2">
          <Banknote className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-muted-foreground">No transfer history available</p>
        </div>
      )}
    </div>
  );
};

export default TransferHistory;
