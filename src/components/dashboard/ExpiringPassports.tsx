import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import StatusBadge from "@/components/ui/StatusBadge";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { passportService } from "@/services/passportService";
import { type Passport } from "@/types";
import { Loader2 } from "lucide-react";
import { differenceInDays } from "date-fns";

const ExpiringPassports = () => {
  const [expiringPassports, setExpiringPassports] = useState<Passport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExpiringPassports = async () => {
      try {
        setLoading(true);
        // Get passports expiring within 90 days
        const data = await passportService.getExpiringPassports(90);
        
        // Sort by expiry date (ascending)
        const sortedPassports = [...data].sort((a, b) => 
          new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
        );
        
        setExpiringPassports(sortedPassports);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching expiring passports:", err);
        setError("Failed to load expiring passport data");
        setLoading(false);
      }
    };

    fetchExpiringPassports();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Passports Expiring Soon</CardTitle>
          <CardDescription>Loading expiring passport data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Passports Expiring Soon</CardTitle>
          <CardDescription className="text-red-500">{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

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
            const expiryDate = new Date(passport.expiry_date);
            const daysToExpiry = differenceInDays(expiryDate, today);
            const expiryColor = daysToExpiry <= 30 ? "text-passport-red" : "text-passport-amber";
            
            return (
              <div key={passport.id} className="flex items-center justify-between border-b pb-3">
                <div className="space-y-1">
                  <p className="font-medium">{passport.employee_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Passport: {passport.passport_number} 
                    <span className="mx-1">•</span> 
                    ID: {passport.employee_id}
                  </p>
                  <StatusBadge status={passport.status} />
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Expires</p>
                  <p className={`font-medium ${expiryColor}`}>
                    {format(expiryDate, "MMM d, yyyy")}
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
