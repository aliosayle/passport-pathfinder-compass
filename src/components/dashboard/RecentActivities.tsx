import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, compareDesc } from "date-fns";
import { Loader2, Plane, FileText, User, BookOpen } from "lucide-react";
import { passportService } from "@/services/passportService";
import { ticketService } from "@/services/ticketService";
import { employeeService } from "@/services/employeeService";
import { flightService } from "@/services/flightService";

interface Activity {
  id: string;
  type: 'passport' | 'flight' | 'ticket' | 'employee';
  action: string;
  user: string;
  subject: string;
  timestamp: string;
}

const RecentActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        setLoading(true);
        
        // Fetch recent data from various endpoints to create an activity timeline
        const [passports, tickets, employees, flights] = await Promise.all([
          passportService.getAll(),
          ticketService.getAll(),
          employeeService.getAll(),
          flightService.getAll()
        ]);
        
        // Convert passport data to activities
        const passportActivities: Activity[] = passports
          .slice(0, 5)
          .map(passport => ({
            id: `p-${passport.id}`,
            type: 'passport',
            action: passport.last_updated ? 'updated' : 'added',
            user: 'Admin',
            subject: `${passport.employee_name}'s passport`,
            timestamp: passport.last_updated || new Date().toISOString()
          }));
          
        // Convert ticket data to activities  
        const ticketActivities: Activity[] = tickets
          .slice(0, 5)
          .map(ticket => ({
            id: `t-${ticket.id}`,
            type: 'ticket',
            action: ticket.status.toLowerCase(),
            user: 'Admin',
            subject: `Ticket #${ticket.reference || ticket.id}`,
            timestamp: ticket.last_updated || new Date().toISOString()
          }));
          
        // Convert employee data to activities
        const employeeActivities: Activity[] = employees
          .slice(0, 3)
          .map(employee => ({
            id: `e-${employee.id}`,
            type: 'employee',
            action: 'added',
            user: 'HR',
            subject: `Employee: ${employee.name}`,
            timestamp: employee.last_updated || new Date().toISOString()
          }));
          
        // Convert flight data to activities
        const flightActivities: Activity[] = flights
          .slice(0, 3)
          .map(flight => ({
            id: `f-${flight.id}`,
            type: 'flight',
            action: flight.status.toLowerCase(),
            user: 'Travel',
            subject: `Flight to ${flight.destination}`,
            timestamp: flight.last_updated || new Date().toISOString()
          }));
        
        // Combine all activities
        const allActivities = [
          ...passportActivities,
          ...ticketActivities, 
          ...employeeActivities,
          ...flightActivities
        ];
        
        // Sort by most recent first and take top 5
        const sortedActivities = allActivities
          .sort((a, b) => compareDesc(parseISO(a.timestamp), parseISO(b.timestamp)))
          .slice(0, 5);
        
        setActivities(sortedActivities);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching recent activities:", error);
        setLoading(false);
      }
    };

    fetchRecentActivities();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'passport':
        return <BookOpen className="h-4 w-4" />;
      case 'flight':
        return <Plane className="h-4 w-4" />;
      case 'ticket':
        return <FileText className="h-4 w-4" />;
      case 'employee':
        return <User className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'passport':
        return "bg-blue-100 text-blue-800";
      case 'flight':
        return "bg-green-100 text-green-800";
      case 'ticket':
        return "bg-amber-100 text-amber-800";
      case 'employee':
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Loading activity data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
        <CardDescription>Latest updates in the system</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="flex justify-center items-center py-8 text-muted-foreground">
            No recent activities found
          </div>
        ) : (
          <div className="space-y-5">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 border-b pb-4 last:border-0">
                <div className={`rounded-full p-2 ${getActivityColor(activity.type)} flex-shrink-0`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="space-y-1 flex-grow">
                  <div className="flex justify-between items-start">
                    <p className="font-medium">{activity.subject}</p>
                    <span className="text-xs text-muted-foreground">
                      {format(parseISO(activity.timestamp), "MMM d, h:mm a")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {activity.type}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {activity.action} by {activity.user}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivities;