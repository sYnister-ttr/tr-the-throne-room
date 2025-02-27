
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
import AdminPage from "@/pages/Admin";
import NotFound from "@/pages/NotFound";
import Runewords from "@/pages/Runewords";
import AddRuneword from "@/pages/AddRuneword";

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
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
