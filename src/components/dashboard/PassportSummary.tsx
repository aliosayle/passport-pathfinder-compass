import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { passportService } from "@/services/passportService";
import { Loader2 } from "lucide-react";

interface PassportStats {
  totalCount: number;
  expiringIn30Days: number;
  expiringIn90Days: number;
  withCompany: number;
  withEmployee: number;
  withDGM: number;
}

const PassportSummary = () => {
  const [stats, setStats] = useState<PassportStats>({
    totalCount: 0,
    expiringIn30Days: 0,
    expiringIn90Days: 0,
    withCompany: 0,
    withEmployee: 0,
    withDGM: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPassportStats = async () => {
      try {
        setLoading(true);
        
        // Get all passports
        const allPassports = await passportService.getAll();
        
        // Get passports expiring within 30 days and 90 days
        const expiring30 = await passportService.getExpiringPassports(30);
        const expiring90 = await passportService.getExpiringPassports(90);
        
        // Count passports by status
        const withCompanyCount = allPassports.filter(p => p.status === 'With Company').length;
        const withEmployeeCount = allPassports.filter(p => p.status === 'With Employee').length;
        const withDGMCount = allPassports.filter(p => p.status === 'With DGM').length;
        
        setStats({
          totalCount: allPassports.length,
          expiringIn30Days: expiring30.length,
          expiringIn90Days: expiring90.length - expiring30.length, // Exclude the ones expiring in 30 days
          withCompany: withCompanyCount,
          withEmployee: withEmployeeCount,
          withDGM: withDGMCount
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching passport statistics:", error);
        setLoading(false);
      }
    };

    fetchPassportStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center py-2">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Passports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.totalCount}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Expiring Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm">Within 30 days</span>
              <span className="text-xl font-semibold text-passport-red">{stats.expiringIn30Days}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Within 90 days</span>
              <span className="text-xl font-semibold text-passport-amber">{stats.expiringIn90Days}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Passport Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm">With Company</span>
              <span className="text-xl font-semibold text-passport-blue">{stats.withCompany}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">With Employee</span>
              <span className="text-xl font-semibold text-passport-green">{stats.withEmployee}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">With DGM</span>
              <span className="text-xl font-semibold text-passport-amber">{stats.withDGM}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PassportSummary;
