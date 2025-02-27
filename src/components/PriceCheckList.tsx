
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface PriceCheck {
  id: string;
  item_name: string;
  description?: string;
  game: string;
  platform: string;
  game_mode: string;
  ladder_status: string;
  responses_count: number;
  created_at: string;
  profiles?: {
    username: string;
  };
}

const PriceCheckList = ({ userId }: { userId?: string }) => {
  const [priceChecks, setPriceChecks] = useState<PriceCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchPriceChecks();
  }, [userId]);

  const fetchPriceChecks = async () => {
    try {
      console.log("Fetching price checks for userId:", userId);
      let query = supabase
        .from("price_checks")
        .select(`
          *,
          profiles (
            username
          )
        `)
        .order("created_at", { ascending: false });

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Price checks query error:", error);
        throw error;
      }
      
      console.log("Fetched price checks:", data);
      setPriceChecks(data || []);
    } catch (error: any) {
      console.error("Error fetching price checks:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load price checks",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading price checks...</div>;
  }

  if (priceChecks.length === 0) {
    return <div className="text-gray-400">No price checks found.</div>;
  }

  return (
    <div className="space-y-4">
      {priceChecks.map((check) => (
        <div
          key={check.id}
          className="bg-black/50 border border-gray-800 rounded-lg p-4 space-y-2"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-white">{check.item_name}</h3>
              <p className="text-sm text-gray-400">
                Game: {check.game === "diablo4" ? "Diablo 4" : "Diablo 2: Resurrected"}
              </p>
              <p className="text-sm text-gray-400">
                Posted by: {check.profiles?.username || "Unknown"}
              </p>
              <p className="text-sm text-gray-400">
                Responses: {check.responses_count || 0}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/market/price-check/${check.id}`)}
            >
              View Details
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PriceCheckList;
