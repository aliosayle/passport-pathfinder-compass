
import Layout from "@/components/layout/Layout";
import TicketList from "@/components/ticket/TicketList";

const TicketsPage = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Travel Tickets</h1>
        <TicketList />
      </div>
    </Layout>
  );
};

export default TicketsPage;
