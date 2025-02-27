
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase, checkTableAccess } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface PriceCheck {
  id: string;
  item_name: string;
  game: string;
  created_at: string;
  responses_count: number;
  profiles?: {
    username: string;
  };
}

const PriceCheckList = ({ userId }: { userId?: string }) => {
  const [priceChecks, setPriceChecks] = useState<PriceCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessError, setAccessError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    console.log("PriceCheckList component mounted, userId:", userId);
    checkTablePermissions();
  }, [userId]);

  const checkTablePermissions = async () => {
    // Check if we can access the price_checks table (RLS check)
    const hasAccess = await checkTableAccess("price_checks");
    if (!hasAccess) {
      console.error("No access to price_checks table. Check RLS policies.");
      setAccessError("Unable to access price checks data. Please check Supabase RLS policies.");
      setLoading(false);
      return;
    }
    
    fetchPriceChecks();
  };

  const fetchPriceChecks = async () => {
    try {
      console.log("Fetching price checks for userId:", userId);
      setLoading(true);
      
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
      } else {
        // If no userId is provided, just limit the results
        query = query.limit(5);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Price checks query error:", error);
        setAccessError(`Error fetching price checks: ${error.message}`);
        throw error;
      }
      
      console.log("Fetched price checks:", data);
      setPriceChecks(data || []);
      setAccessError(null);
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
    return <div className="text-center py-4 text-gray-400">Loading price checks...</div>;
  }

  if (accessError) {
    return (
      <div className="text-center py-4 bg-red-900/30 border border-red-700 rounded-md">
        <p className="text-red-400">{accessError}</p>
        <p className="text-sm text-gray-400 mt-2">
          This is likely due to Supabase Row Level Security (RLS) policies.
          You may need to enable public read access to the price_checks table.
        </p>
      </div>
    );
  }

  if (priceChecks.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-400 mb-4">No price checks found.</p>
        {userId && (
          <Button 
            onClick={() => window.location.href = "/price-check"}
            className="bg-diablo-600 hover:bg-diablo-700"
          >
            Create a Price Check
          </Button>
        )}
      </div>
    );
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
              onClick={() => window.location.href = `/price-check/${check.id}`}
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
