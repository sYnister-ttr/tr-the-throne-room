import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Trade } from "@/types/trading";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";  // Updated import path
import TradeCard from "@/components/TradeCard";
import PriceCheckList from "@/components/PriceCheckList";

const Market = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Trades query error:", error);
        throw error;
      }

      setTrades(data || []);
    } catch (error: any) {
      console.error("Error fetching trades:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load trades",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Marketplace</h1>
          <Button
            onClick={() => navigate("/market/create")}
            className="bg-diablo-600 hover:bg-diablo-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Listing
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Latest Listings
            </h2>
            {loading ? (
              <div className="text-center py-8 text-gray-400">
                Loading listings...
              </div>
            ) : trades.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No listings found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trades.map((trade) => (
                  <TradeCard key={trade.id} trade={trade} />
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">
              Recent Price Checks
            </h2>
            <PriceCheckList userId={user?.id} />
            {user && (
              <Button
                onClick={() => navigate("/price-check")}
                variant="secondary"
                className="w-full mt-4"
              >
                Check an Item Price
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Market;
