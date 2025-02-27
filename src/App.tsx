
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Market from "./pages/Market";
import NotFound from "./pages/NotFound";
import CreateTrade from "./pages/CreateTrade";
import TradeDetails from "./pages/TradeDetails";
import PriceCheck from "./pages/PriceCheck";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/market" 
              element={
                <ProtectedRoute>
                  <Market />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/market/create" 
              element={
                <ProtectedRoute>
                  <CreateTrade />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/market/trade/:id" 
              element={
                <ProtectedRoute>
                  <TradeDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/market/price-check" 
              element={
                <ProtectedRoute>
                  <PriceCheck />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
