
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Trade } from "@/types/trading";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import TradeCard from "@/components/TradeCard";
import PriceCheckList from "@/components/PriceCheckList";

const Market = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    console.log("Market component mounted");
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    try {
      console.log("Fetching trades...");
      setLoading(true);
      
      const { data, error } = await supabase
        .from("trades")
        .select(`
          *,
          profiles (username)
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching trades:", error);
        throw error;
      }
      
      console.log("Fetched trades:", data);
      setTrades(data || []);
    } catch (error: any) {
      console.error("Error in fetchTrades:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch trades. Please try refreshing the page.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24">
        <div className="space-y-12">
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-white">Market</h1>
              <div className="flex gap-4">
                <Button
                  onClick={() => navigate("/market/create")}
                  className="bg-diablo-600 hover:bg-diablo-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  List Item
                </Button>
                <Button
                  onClick={() => navigate("/price-check")}
                  variant="outline"
                >
                  Price Check
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-400">
                <p>Loading trades...</p>
              </div>
            ) : trades.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>No trades found</p>
                <Button 
                  onClick={() => navigate("/market/create")}
                  className="mt-4 bg-diablo-600 hover:bg-diablo-700"
                >
                  Create Your First Listing
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trades.map((trade) => (
                  <TradeCard key={trade.id} trade={trade} />
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Recent Price Checks</h2>
            <PriceCheckList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Market;
