
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import PassportSummary from "@/components/dashboard/PassportSummary";
import ExpiringPassports from "@/components/dashboard/ExpiringPassports";
import PassportList from "@/components/PassportList";
import PassportForm from "@/components/PassportForm";
import PassportDetail from "@/components/PassportDetail";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Passport } from "@/types";
import { addPassport, updatePassport } from "@/lib/data";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
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

  const handleFormSubmit = (data: Omit<Passport, 'id' | 'lastUpdated'>) => {
    try {
      if (isEditMode && selectedPassport) {
        const updated = updatePassport({
          ...data,
          id: selectedPassport.id,
          lastUpdated: new Date()
        });
        toast({
          title: "Passport Updated",
          description: `${updated.employeeName}'s passport has been updated successfully.`
        });
      } else {
        const newPassport = addPassport(data);
        toast({
          title: "Passport Added",
          description: `${newPassport.employeeName}'s passport has been added successfully.`
        });
      }
      setIsFormOpen(false);
    } catch (error) {
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
          <h1 className="text-3xl font-bold">Passport Management System</h1>
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link to="/employees">View Employees</Link>
            </Button>
            <Button onClick={handleAddPassport}>Add New Passport</Button>
          </div>
        </div>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="passports">All Passports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6">
            <PassportSummary />
            <ExpiringPassports />
          </TabsContent>
          
          <TabsContent value="passports">
            <PassportList 
              onSelect={handleViewPassport}
              onEdit={handleEditPassport}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <PassportForm 
            passport={isEditMode ? selectedPassport || undefined : undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[700px]">
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
