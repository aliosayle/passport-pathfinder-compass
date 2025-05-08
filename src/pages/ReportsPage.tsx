import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from "../components/layout/Layout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Calendar } from "../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { useToast } from "../hooks/use-toast";
import { format } from "date-fns";
import { CalendarIcon, ChevronDown, FileText, FileJson, BarChart, Loader2, File } from "lucide-react";
import { cn } from "../lib/utils";
import { reportService, EmployeeReport } from '../services/reportService';
import { employeeService } from '../services/employeeService';
import ReportViewer from "../components/report/ReportViewer";

interface Employee {
  id: string;
  name: string;
}

const apiBaseUrl = import.meta.env.VITE_API_URL || '';

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [report, setReport] = useState<EmployeeReport | null>(null);
  const [transferStartDate, setTransferStartDate] = useState<Date | undefined>(new Date());
  const [transferEndDate, setTransferEndDate] = useState<Date | undefined>(new Date());
  const [isDownloadingTransfersReport, setIsDownloadingTransfersReport] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch employees on component mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const employees = await employeeService.getAll();
        setEmployees(employees);
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch employees. Please try again."
        });
      }
    };

    fetchEmployees();
  }, [toast]);

  const handleGenerateReport = async () => {
    if (!selectedEmployeeId || !startDate || !endDate) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select an employee and date range"
      });
      return;
    }

    setLoading(true);
    try {
      const reportData = await reportService.generateEmployeeReport({
        employeeId: selectedEmployeeId,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd')
      });
      
      setReport(reportData);
      toast({
        title: "Success",
        description: "Report generated successfully"
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate report. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (fileFormat: 'pdf' | 'json' = 'pdf') => {
    if (!selectedEmployeeId || !startDate || !endDate) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select an employee and date range"
      });
      return;
    }

    setDownloadLoading(true);
    try {
      await reportService.downloadEmployeeReport({
        employeeId: selectedEmployeeId,
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        format: fileFormat
      });
      
      toast({
        title: "Success",
        description: `Report downloaded successfully as ${fileFormat.toUpperCase()}`
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download report. Please try again."
      });
    } finally {
      setDownloadLoading(false);
    }
  };

  // Function to download transfers report
  const downloadTransfersReport = async () => {
    if (!transferStartDate || !transferEndDate) {
      toast({
        variant: "destructive",
        title: "Missing dates",
        description: "Please select both start and end dates.",
      });
      return;
    }

    try {
      setIsDownloadingTransfersReport(true);
      
      // Format dates for API
      const startDateStr = format(transferStartDate, "yyyy-MM-dd");
      const endDateStr = format(transferEndDate, "yyyy-MM-dd");
      
      // Create direct download URL - using the correct URL structure
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('passport_pathfinder_token');
      
      // The baseUrl might already include '/api', so check before constructing the URL
      const apiPrefix = baseUrl.endsWith('/api') ? '' : '/api';
      const downloadUrl = `${baseUrl}${apiPrefix}/reports/transfers/download?startDate=${startDateStr}&endDate=${endDateStr}&format=excel&token=${token}`;
      
      console.log("Download URL:", downloadUrl);
      
      // Open in new window to trigger download
      window.open(downloadUrl, '_blank');
      
      toast({
        title: "Report Generated",
        description: "Your transfers report is being downloaded.",
      });
    } catch (error) {
      console.error("Error downloading report:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Failed to download the transfers report. Please try again.",
      });
    } finally {
      setIsDownloadingTransfersReport(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Employee Reports</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Generate Report</CardTitle>
            <CardDescription>
              Select an employee and date range to generate a comprehensive report
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Employee Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Employee</label>
                <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name} ({employee.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                onClick={handleGenerateReport}
                disabled={loading || !selectedEmployeeId || !startDate || !endDate}
                className="bg-primary hover:bg-primary/90"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <BarChart className="mr-2 h-4 w-4" />
                Generate Report
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={downloadLoading || !selectedEmployeeId || !startDate || !endDate}
                    className="flex items-center"
                  >
                    {downloadLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Download Report
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleDownloadReport('pdf')}>
                    <FileText className="mr-2 h-4 w-4" />
                    PDF Format
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDownloadReport('json')}>
                    <FileJson className="mr-2 h-4 w-4" />
                    JSON Format
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Report Viewer */}
        {report && <ReportViewer report={report} />}

        {/* Transfers Report Section */}
        <Card>
          <CardHeader>
            <CardTitle>Money Transfers Report</CardTitle>
            <CardDescription>
              Generate an Excel report of all money transfers within a specified date range.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start Date Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !transferStartDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {transferStartDate ? (
                        format(transferStartDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={transferStartDate}
                      onSelect={setTransferStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* End Date Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !transferEndDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {transferEndDate ? (
                        format(transferEndDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={transferEndDate}
                      onSelect={setTransferEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={downloadTransfersReport} 
                disabled={isDownloadingTransfersReport || !transferStartDate || !transferEndDate}
              >
                {isDownloadingTransfersReport ? "Generating..." : "Download Excel Report"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}