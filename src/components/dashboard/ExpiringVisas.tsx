import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays } from "date-fns";
import { useState, useEffect } from "react";
import employeeVisaService, { EmployeeVisa } from "@/services/employeeVisaService";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const ExpiringVisas = () => {
  const [expiringVisas, setExpiringVisas] = useState<EmployeeVisa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const fetchExpiringVisas = async () => {
    try {
      setLoading(true);
      setError("");
      // Get visas expiring within 60 days
      const data = await employeeVisaService.getExpiringVisas(60);
      
      // Sort by expiry date (ascending)
      const sortedVisas = [...data].sort((a, b) => 
        new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
      );
      
      setExpiringVisas(sortedVisas);
    } catch (err) {
      console.error("Error fetching expiring visas:", err);
      setError("Failed to load expiring visa data");
      toast({
        title: "Error",
        description: "Could not load expiring visa information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpiringVisas();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Visas Expiring Soon</CardTitle>
          <CardDescription>Loading visa data...</CardDescription>
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
          <CardTitle>Visas Expiring Soon</CardTitle>
          <CardDescription className="flex items-center text-red-500">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            size="sm" 
            className="mx-auto flex items-center" 
            onClick={fetchExpiringVisas}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (expiringVisas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Visas Expiring Soon</CardTitle>
          <CardDescription>No visas expiring within the next 60 days.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Link to="/visas">
              <Button variant="outline" size="sm">
                Manage Visas
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Visas Expiring Soon</CardTitle>
          <CardDescription>Visas that need attention in the next 60 days</CardDescription>
        </div>
        <Link to="/visas">
          <Button variant="outline" size="sm">View All</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {expiringVisas.map((visa) => {
            const today = new Date();
            const expiryDate = new Date(visa.expiry_date);
            const daysToExpiry = differenceInDays(expiryDate, today);
            const isExpired = daysToExpiry < 0;
            const expiryColor = isExpired 
              ? "text-red-600" 
              : daysToExpiry <= 30 
                ? "text-amber-600" 
                : "text-muted-foreground";
            
            return (
              <div key={visa.id} className="flex items-center justify-between border-b pb-3">
                <div className="space-y-1">
                  <p className="font-medium">{visa.employee_name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{visa.country_name}</Badge>
                    <Badge variant="secondary">{visa.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {visa.document_number && `Doc #: ${visa.document_number}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {isExpired ? "Expired on" : "Expires on"}
                  </p>
                  <p className={`font-medium ${expiryColor}`}>
                    {format(expiryDate, "MMM d, yyyy")}
                  </p>
                  <p className={`text-sm ${expiryColor}`}>
                    {isExpired 
                      ? `${Math.abs(daysToExpiry)} days ago`
                      : `In ${daysToExpiry} days`
                    }
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

export default ExpiringVisas;