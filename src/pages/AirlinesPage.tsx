
import Layout from "@/components/layout/Layout";
import AirlineList from "@/components/airline/AirlineList";

const AirlinesPage = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Airlines</h1>
        <AirlineList />
      </div>
    </Layout>
  );
};

export default AirlinesPage;
