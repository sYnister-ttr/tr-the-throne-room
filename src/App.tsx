
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Market from "@/pages/Market";
import PriceCheck from "@/pages/PriceCheck";
import PriceCheckDetails from "@/pages/PriceCheckDetails";
import CreateTrade from "@/pages/CreateTrade";
import TradeDetails from "@/pages/TradeDetails";
import Profile from "@/pages/Profile";
import ItemDatabase from "@/pages/ItemDatabase";
import NotFound from "@/pages/NotFound";
import Runewords from "@/pages/Runewords";
import AddRuneword from "@/pages/AddRuneword";
import Admin from "@/pages/Admin";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/market" element={<Market />} />
            <Route path="/market/trade/:id" element={<TradeDetails />} />
            <Route
              path="/market/create"
              element={
                <ProtectedRoute>
                  <CreateTrade />
                </ProtectedRoute>
              }
            />
            <Route path="/price-check" element={<PriceCheck />} />
            <Route path="/price-check/:id" element={<PriceCheckDetails />} />
            <Route path="/items" element={<ItemDatabase />} />
            <Route path="/runewords" element={<Runewords />} />
            <Route
              path="/runewords/add"
              element={
                <ProtectedRoute>
                  <AddRuneword />
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
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
