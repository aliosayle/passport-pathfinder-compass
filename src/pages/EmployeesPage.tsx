import { useState } from "react";
import Layout from "@/components/layout/Layout";
import EmployeeList from "@/components/employee/EmployeeList";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const EmployeesPage = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Employees</h1>
            <p className="text-muted-foreground mt-1">
              Manage employee records and associated passport information
            </p>
          </div>
        </div>
        
        <EmployeeList />
      </div>
    </Layout>
  );
};

export default EmployeesPage;
