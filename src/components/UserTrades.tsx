
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Trade } from "@/types/trading";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const UserTrades = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserTrades();
  }, [user]);

  const fetchUserTrades = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrades(data || []);
    } catch (error: any) {
      console.error('Error fetching trades:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your trades",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tradeId: string) => {
    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', tradeId);

      if (error) throw error;

      setTrades(trades.filter(trade => trade.id !== tradeId));
      toast({
        title: "Success",
        description: "Trade deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting trade:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete trade",
      });
    }
  };

  if (loading) {
    return <div>Loading your trades...</div>;
  }

  return (
    <div className="space-y-4">
      {trades.length === 0 ? (
        <p className="text-gray-400">You haven't listed any trades yet.</p>
      ) : (
        trades.map((trade) => (
          <div
            key={trade.id}
            className="bg-black/50 border border-gray-800 rounded-lg p-4 space-y-2"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-white">{trade.title}</h3>
                <p className="text-sm text-gray-400">
                  Price: {trade.payment_type === 'currency' ? `${trade.price} FG` : 'Item Trade'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/market/trade/${trade.id}`)}
                >
                  View
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your trade listing.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(trade.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default UserTrades;
