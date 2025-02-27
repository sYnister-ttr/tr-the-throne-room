
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase, checkTableAccess } from "@/lib/supabase";
import { Trade } from "@/types/trading";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import TradeCard from "@/components/TradeCard";
import PriceCheckList from "@/components/PriceCheckList";

const Market = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    console.log("Market component mounted");
    checkTablePermissions();
  }, []);

  const checkTablePermissions = async () => {
    // Check if we can access the trades table (RLS check)
    const hasAccess = await checkTableAccess("trades");
    if (!hasAccess) {
      console.error("No access to trades table. Check RLS policies.");
      setAccessError("Unable to access trades data. Please check Supabase RLS policies.");
      setLoading(false);
      return;
    }
    
    fetchTrades();
  };

  const fetchTrades = async () => {
    try {
      console.log("Fetching trades...");
      setLoading(true);
      
      const { data, error } = await supabase
        .from("trades")
        .select(`
          *,
          profiles (
            username
          )
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching trades:", error);
        setAccessError(`Error fetching trades: ${error.message}`);
        throw error;
      }
      
      console.log("Fetched trades:", data);
      setTrades(data || []);
      setAccessError(null);
    } catch (error: any) {
      console.error("Error in fetchTrades:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch trades",
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

            {accessError && (
              <div className="text-center py-4 bg-red-900/30 border border-red-700 rounded-md mb-6">
                <p className="text-red-400">{accessError}</p>
                <p className="text-sm text-gray-400 mt-2">
                  This is likely due to Supabase Row Level Security (RLS) policies.
                  You may need to enable public read access to the trades table.
                </p>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12 text-gray-400">
                <p>Loading trades...</p>
              </div>
            ) : trades.length === 0 && !accessError ? (
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
