
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Market from "@/pages/Market";
import CreateTrade from "@/pages/CreateTrade";
import TradeDetails from "@/pages/TradeDetails";
import PriceCheck from "@/pages/PriceCheck";
import Profile from "@/pages/Profile";

function App() {
  return (
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
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;
