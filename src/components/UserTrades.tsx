
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Trade } from "@/types/trading";

interface UserTradesProps {
  userId?: string;
}

const UserTrades = ({ userId }: UserTradesProps) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    console.log("UserTrades component mounted, userId:", userId);
    if (userId) {
      fetchUserTrades();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const fetchUserTrades = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    try {
      console.log("Fetching trades for user ID:", userId);
      setLoading(true);
      
      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching user trades:", error);
        throw error;
      }
      
      console.log("User trades:", data);
      setTrades(data || []);
    } catch (error: any) {
      console.error("Error in fetchUserTrades:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your listings",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return <div className="text-center text-gray-400">Please log in to view your trades</div>;
  }

  if (loading) {
    return <div className="text-center text-gray-400">Loading your listings...</div>;
  }

  if (trades.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-400 mb-4">You haven't created any listings yet.</p>
        <Button 
          onClick={() => navigate("/market/create")}
          className="bg-diablo-600 hover:bg-diablo-700"
        >
          Create a Listing
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {trades.map((trade) => (
        <div
          key={trade.id}
          className="bg-black/50 border border-gray-800 rounded-lg p-4 space-y-2"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-white">{trade.title}</h3>
              <p className="text-sm text-gray-400">
                Status: <span className={`font-medium ${trade.status === "active" ? "text-green-500" : "text-yellow-500"}`}>
                  {trade.status === "active" ? "Active" : "Closed"}
                </span>
              </p>
              <p className="text-sm text-gray-400">
                {trade.payment_type === "currency" 
                  ? `Price: ${trade.price} FG` 
                  : `Trading for: ${trade.payment_items || "Items"}`}
              </p>
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/market/trade/${trade.id}`)}
              >
                View
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserTrades;
