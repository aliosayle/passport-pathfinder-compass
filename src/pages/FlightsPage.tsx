
import Layout from "@/components/layout/Layout";
import FlightList from "@/components/flight/FlightList";

const FlightsPage = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Employee Flights</h1>
        <FlightList />
      </div>
    </Layout>
  );
};

export default FlightsPage;
