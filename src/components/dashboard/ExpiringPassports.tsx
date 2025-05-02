
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getExpiringPassports, daysBetweenDates } from "@/lib/data";
import StatusBadge from "@/components/ui/StatusBadge";
import { format } from "date-fns";

const ExpiringPassports = () => {
  const expiringPassports = getExpiringPassports(90);

  if (expiringPassports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Passports Expiring Soon</CardTitle>
          <CardDescription>No passports expiring within the next 90 days.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Passports Expiring Soon</CardTitle>
        <CardDescription>Passports that need attention in the next 90 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {expiringPassports.map((passport) => {
            const today = new Date();
            const daysToExpiry = daysBetweenDates(today, passport.expiryDate);
            const expiryColor = daysToExpiry <= 30 ? "text-passport-red" : "text-passport-amber";
            
            return (
              <div key={passport.id} className="flex items-center justify-between border-b pb-3">
                <div className="space-y-1">
                  <p className="font-medium">{passport.employeeName}</p>
                  <p className="text-sm text-muted-foreground">
                    Passport: {passport.passportNumber} 
                    <span className="mx-1">•</span> 
                    ID: {passport.employeeId}
                  </p>
                  <StatusBadge status={passport.status} />
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Expires</p>
                  <p className={`font-medium ${expiryColor}`}>
                    {format(passport.expiryDate, "MMM d, yyyy")}
                  </p>
                  <p className={`text-sm ${expiryColor}`}>
                    In {daysToExpiry} days
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpiringPassports;
