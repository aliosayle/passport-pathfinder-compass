
import Layout from "@/components/layout/Layout";
import VisaList from "@/components/visa/VisaList";

const VisasPage = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Visa Types</h1>
        <VisaList />
      </div>
    </Layout>
  );
};

export default VisasPage;
