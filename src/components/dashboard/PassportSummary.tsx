
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPassportStats } from "@/lib/data";

const PassportSummary = () => {
  const stats = getPassportStats();

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
