import Layout from "@/components/layout/Layout";
import VisaList from "@/components/visa/VisaList";
import EmployeeVisaList from "@/components/visa/EmployeeVisaList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { Globe, UserCheck } from "lucide-react";

const VisasPage = () => {
  const [activeTab, setActiveTab] = useState("visa-types");

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Visa Management</h1>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="visa-types" className="flex items-center">
              <Globe className="h-4 w-4 mr-2" /> Visa Types
            </TabsTrigger>
            <TabsTrigger value="employee-visas" className="flex items-center">
              <UserCheck className="h-4 w-4 mr-2" /> Employee Visas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visa-types">
            <VisaList />
          </TabsContent>

          <TabsContent value="employee-visas">
            <EmployeeVisaList />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default VisasPage;
