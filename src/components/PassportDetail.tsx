
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Passport } from "@/types";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/ui/StatusBadge";
import { daysBetweenDates } from "@/lib/data";

interface PassportDetailProps {
  passport: Passport;
  onEdit?: () => void;
  onClose?: () => void;
}

const PassportDetail = ({ passport, onEdit, onClose }: PassportDetailProps) => {
  const today = new Date();
  const daysToExpiry = passport.expiryDate > today ? 
    daysBetweenDates(today, passport.expiryDate) : 0;
  
  const isExpired = passport.expiryDate < today;
  const expiryStatus = isExpired ? 
    "Expired" : 
    daysToExpiry <= 30 ? 
      "Expires soon" : 
      daysToExpiry <= 90 ? 
        "Expiring in 3 months" : 
        "Valid";

  const expiryColor = isExpired ? 
    "text-passport-red" : 
    daysToExpiry <= 30 ? 
      "text-passport-red" : 
      daysToExpiry <= 90 ? 
        "text-passport-amber" : 
        "text-passport-green";

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-wrap justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{passport.employeeName}</CardTitle>
            <CardDescription>Employee ID: {passport.employeeId}</CardDescription>
          </div>
          <StatusBadge status={passport.status} className="mt-1" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">Passport Number</h3>
              <p className="font-medium">{passport.passportNumber}</p>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">Nationality</h3>
              <p className="font-medium">{passport.nationality}</p>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">Issue Date</h3>
              <p className="font-medium">{format(passport.issueDate, "MMMM d, yyyy")}</p>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">Expiry Date</h3>
              <p className={`font-medium ${expiryColor}`}>
                {format(passport.expiryDate, "MMMM d, yyyy")}
                <span className="ml-2 text-sm">({expiryStatus})</span>
              </p>
            </div>
            
            {passport.ticketReference && (
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">Ticket Reference</h3>
                <p className="font-medium">{passport.ticketReference}</p>
              </div>
            )}
            
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
              <p className="font-medium">{format(passport.lastUpdated, "MMMM d, yyyy")}</p>
            </div>
          </div>
          
          {passport.notes && (
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
              <p className="text-sm">{passport.notes}</p>
            </div>
          )}
          
          <div className="flex justify-end space-x-4 pt-4">
            {onEdit && (
              <Button onClick={onEdit} variant="default">
                Edit Passport
              </Button>
            )}
            {onClose && (
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PassportDetail;
