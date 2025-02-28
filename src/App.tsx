
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/market" element={<Market />} />
          <Route path="/market/trade/:id" element={<TradeDetails />} />
          <Route path="/market/create" element={<CreateTrade />} />
          <Route path="/price-check" element={<PriceCheck />} />
          <Route path="/price-check/:id" element={<PriceCheckDetails />} />
          <Route path="/items" element={<ItemDatabase />} />
          <Route path="/runewords" element={<Runewords />} />
          <Route path="/runewords/add" element={<AddRuneword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
