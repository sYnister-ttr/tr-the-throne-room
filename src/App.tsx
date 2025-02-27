
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Market from "@/pages/Market";
import CreateTrade from "@/pages/CreateTrade";
import TradeDetails from "@/pages/TradeDetails";
import PriceCheck from "@/pages/PriceCheck";
import PriceCheckDetails from "@/pages/PriceCheckDetails";
import Profile from "@/pages/Profile";
import ItemDatabase from "@/pages/ItemDatabase";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
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
            <Route
              path="/market/price-check/:id"
              element={
                <ProtectedRoute>
                  <PriceCheckDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="/items" element={<ItemDatabase />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
