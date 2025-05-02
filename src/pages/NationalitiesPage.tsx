
import Layout from "@/components/layout/Layout";
import NationalityList from "@/components/nationality/NationalityList";

const NationalitiesPage = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Nationalities</h1>
        <NationalityList />
      </div>
    </Layout>
  );
};

export default NationalitiesPage;
