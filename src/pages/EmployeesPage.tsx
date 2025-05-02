
import Layout from "@/components/layout/Layout";
import EmployeeList from "@/components/employee/EmployeeList";

const EmployeesPage = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Employees & Passports</h1>
        <EmployeeList />
      </div>
    </Layout>
  );
};

export default EmployeesPage;
