import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import FlightsPage from "./pages/FlightsPage";
import TicketsPage from "./pages/TicketsPage";
import NationalitiesPage from "./pages/NationalitiesPage";
import AirlinesPage from "./pages/AirlinesPage";
import VisasPage from "./pages/VisasPage";
import EmployeePage from "./pages/EmployeePage";
import EmployeesPage from "./pages/EmployeesPage";
import LoginPage from "./pages/LoginPage";
import UsersPage from "./pages/UsersPage";
import UploadsPage from "./pages/UploadsPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";

// Authentication interceptors are now configured directly in api-client.ts
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public route - Login */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected routes - require authentication */}
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/flights" element={
              <ProtectedRoute>
                <FlightsPage />
              </ProtectedRoute>
            } />
            <Route path="/tickets" element={
              <ProtectedRoute>
                <TicketsPage />
              </ProtectedRoute>
            } />
            <Route path="/nationalities" element={
              <ProtectedRoute>
                <NationalitiesPage />
              </ProtectedRoute>
            } />
            <Route path="/airlines" element={
              <ProtectedRoute>
                <AirlinesPage />
              </ProtectedRoute>
            } />
            <Route path="/visas" element={
              <ProtectedRoute>
                <VisasPage />
              </ProtectedRoute>
            } />
            <Route path="/employees" element={
              <ProtectedRoute>
                <EmployeesPage />
              </ProtectedRoute>
            } />
            <Route path="/employee/:id" element={
              <ProtectedRoute>
                <EmployeePage />
              </ProtectedRoute>
            } />
            <Route path="/uploads" element={
              <ProtectedRoute>
                <UploadsPage />
              </ProtectedRoute>
            } />
            
            {/* Admin-only routes */}
            <Route path="/users" element={
              <ProtectedRoute requiredRoles={['Admin']}>
                <UsersPage />
              </ProtectedRoute>
            } />

            {/* Not found route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
