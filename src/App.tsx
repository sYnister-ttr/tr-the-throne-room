
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "@/pages/Index";
import Market from "@/pages/Market";
import TradeDetails from "@/pages/TradeDetails";
import CreateTrade from "@/pages/CreateTrade";
import PriceCheck from "@/pages/PriceCheck";
import PriceCheckDetails from "@/pages/PriceCheckDetails";
import ItemDatabase from "@/pages/ItemDatabase";
import Runewords from "@/pages/Runewords";
import AddRuneword from "@/pages/AddRuneword";
import Profile from "@/pages/Profile";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/NotFound";
import Admin from "@/pages/Admin";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/market" element={<Market />} />
          <Route path="/market/trade/:id" element={<TradeDetails />} />
          <Route path="/market/create" element={
            <ProtectedRoute>
              <CreateTrade />
            </ProtectedRoute>
          } />
          <Route path="/price-check" element={<PriceCheck />} />
          <Route path="/price-check/:id" element={<PriceCheckDetails />} />
          <Route path="/items" element={<ItemDatabase />} />
          <Route path="/runewords" element={<Runewords />} />
          <Route path="/runewords/add" element={
            <ProtectedRoute>
              <AddRuneword />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
