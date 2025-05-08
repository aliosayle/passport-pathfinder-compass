import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, Users, FileText, Banknote } from "lucide-react";
import { employeeService } from "@/services/employeeService";
import { flightService } from "@/services/flightService";
import { ticketService } from "@/services/ticketService";
import { transferService } from "@/services/transferService";
import { useNavigate } from "react-router-dom";

interface StatsData {
  totalEmployees: number;
  activeFlights: number;
  pendingTickets: number;
  totalTransfers: number;
}

const DashboardStats = () => {
  const [stats, setStats] = useState<StatsData>({
    totalEmployees: 0,
    activeFlights: 0,
    pendingTickets: 0,
    totalTransfers: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch real data from API endpoints
        const employees = await employeeService.getAll();
        const flights = await flightService.getAll();
        const tickets = await ticketService.getAll();
        const transfers = await transferService.getAll();
        
        // Active flights: those with status 'Scheduled' or 'Boarding' or in the future
        const activeFlightsCount = flights.filter(f => 
          f.status === 'Scheduled' || 
          f.status === 'Boarding' ||
          new Date(f.departure_date) > new Date()
        ).length;
        
        // Pending tickets: those with status 'Pending' or 'In Progress'
        const pendingTicketsCount = tickets.filter(t => 
          t.status === 'Pending' || 
          t.status === 'In Progress'
        ).length;
        
        // Get transfers from the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentTransfersCount = transfers.filter(t => 
          new Date(t.date) >= thirtyDaysAgo
        ).length;
        
        setStats({
          totalEmployees: employees.length,
          activeFlights: activeFlightsCount,
          pendingTickets: pendingTicketsCount,
          totalTransfers: recentTransfersCount
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Employees",
      value: stats.totalEmployees,
      description: "Active employee records",
      icon: <Users className="h-8 w-8 text-blue-500" />,
      bgColor: "bg-blue-50",
      loading,
      path: "/employees"
    },
    {
      title: "Active Flights",
      value: stats.activeFlights,
      description: "Currently scheduled",
      icon: <Plane className="h-8 w-8 text-green-500" />,
      bgColor: "bg-green-50",
      loading,
      path: "/flights"
    },
    {
      title: "Pending Tickets",
      value: stats.pendingTickets,
      description: "Requiring approval",
      icon: <FileText className="h-8 w-8 text-amber-500" />,
      bgColor: "bg-amber-50",
      loading,
      path: "/tickets"
    },
    {
      title: "Money Transfers",
      value: stats.totalTransfers,
      description: "Last 30 days",
      icon: <Banknote className="h-8 w-8 text-violet-500" />,
      bgColor: "bg-violet-50",
      loading,
      path: "/transfers"
    }
  ];

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <Card 
          key={index} 
          className="cursor-pointer transform transition-transform hover:scale-105 hover:shadow-md"
          onClick={() => handleCardClick(stat.path)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`rounded-full p-2 ${stat.bgColor}`}>{stat.icon}</div>
          </CardHeader>
          <CardContent>
            {stat.loading ? (
              <div className="h-8 w-16 animate-pulse bg-gray-200 rounded"></div>
            ) : (
              <>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;