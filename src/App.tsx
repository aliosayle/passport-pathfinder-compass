
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import FlightsPage from "./pages/FlightsPage";
import TicketsPage from "./pages/TicketsPage";
import NationalitiesPage from "./pages/NationalitiesPage";
import AirlinesPage from "./pages/AirlinesPage";
import VisasPage from "./pages/VisasPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/flights" element={<FlightsPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/nationalities" element={<NationalitiesPage />} />
          <Route path="/airlines" element={<AirlinesPage />} />
          <Route path="/visas" element={<VisasPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
