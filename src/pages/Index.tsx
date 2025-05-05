import { useState } from "react";
import Layout from "@/components/layout/Layout";
import PassportSummary from "@/components/dashboard/PassportSummary";
import ExpiringPassports from "@/components/dashboard/ExpiringPassports";
import PendingTickets from "@/components/dashboard/PendingTickets";
import PassportList from "@/components/PassportList";
import PassportForm from "@/components/PassportForm";
import PassportDetail from "@/components/PassportDetail";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Passport } from "@/types";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { passportService } from "@/services/passportService";
import { employeeService } from "@/services/employeeService";
import { format } from "date-fns";
import { TicketIcon, Plane, BookOpen } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("tickets");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedPassport, setSelectedPassport] = useState<Passport | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const { toast } = useToast();

  const handleAddPassport = () => {
    setSelectedPassport(null);
    setIsEditMode(false);
    setIsFormOpen(true);
  };

  const handleEditPassport = (passport: Passport) => {
    setSelectedPassport(passport);
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  const handleViewPassport = (passport: Passport) => {
    setSelectedPassport(passport);
    setIsDetailOpen(true);
  };

  const handleFormSubmit = async (data: Omit<Passport, 'id' | 'lastUpdated'>) => {
    try {
      let employeeId = data.employeeId;
      
      try {
        await employeeService.getById(employeeId);
      } catch (err) {
        const newEmployee = {
          id: employeeId,
          name: data.employeeName,
          nationality: data.nationality,
        };
        
        await employeeService.create(newEmployee);
      }
      
      const formattedData = {
        id: isEditMode && selectedPassport ? selectedPassport.id : `P${Date.now()}`,
        employee_name: data.employeeName,
        employee_id: employeeId,
        passport_number: data.passportNumber,
        nationality: data.nationality,
        issue_date: format(data.issueDate, "yyyy-MM-dd"),
        expiry_date: format(data.expiryDate, "yyyy-MM-dd"),
        status: data.status,
        ticket_reference: data.ticketReference || "",
        notes: data.notes || ""
      };

      if (isEditMode && selectedPassport) {
        const { id, ...updateData } = formattedData;
        await passportService.update(id, updateData);
        toast({
          title: "Passport Updated",
          description: `${data.employeeName}'s passport has been updated successfully.`
        });
      } else {
        await passportService.create(formattedData);
        toast({
          title: "Passport Added",
          description: `${data.employeeName}'s passport has been added successfully.`
        });
      }
      
      setIsFormOpen(false);
      
      if (activeTab === "dashboard") {
        setActiveTab("passports");
        setTimeout(() => setActiveTab("dashboard"), 10);
      } else {
        setActiveTab("dashboard");
        setTimeout(() => setActiveTab("passports"), 10);
      }
    } catch (error) {
      console.error("Error submitting passport data:", error);
      toast({
        title: "Error",
        description: "There was an error processing the passport data.",
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Travel Management Dashboard</h1>
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link to="/employees">View Employees</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/flights">View Flights</Link>
            </Button>
            <Button variant="outline" onClick={handleAddPassport}>
              <BookOpen className="h-4 w-4 mr-2" /> 
              Add Passport
            </Button>
          </div>
        </div>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="tickets" className="flex items-center">
              <TicketIcon className="h-4 w-4 mr-2" /> Ticket Management
            </TabsTrigger>
            <TabsTrigger value="passports" className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2" /> Passports
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center">
              Summaries & Reports
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tickets" className="space-y-6">
            <PendingTickets />
          </TabsContent>
          
          <TabsContent value="passports">
            <PassportList 
              onSelect={handleViewPassport}
              onEdit={handleEditPassport}
            />
          </TabsContent>
          
          <TabsContent value="reports" className="space-y-6">
            <PassportSummary />
            <ExpiringPassports />
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogTitle>{isEditMode ? "Edit Passport" : "Add New Passport"}</DialogTitle>
          <DialogDescription>
            {isEditMode 
              ? "Update the passport information for this employee" 
              : "Enter passport details for an employee"
            }
          </DialogDescription>
          <PassportForm 
            passport={isEditMode ? selectedPassport || undefined : undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogTitle>Passport Details</DialogTitle>
          <DialogDescription>View detailed passport information</DialogDescription>
          {selectedPassport && (
            <PassportDetail 
              passport={selectedPassport}
              onEdit={() => {
                setIsDetailOpen(false);
                handleEditPassport(selectedPassport);
              }}
              onClose={() => setIsDetailOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Index;
