
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";

interface TradeOffer {
  id: string;
  offer_details: string;
  status: string;
  created_at: string;
  profiles: {
    username: string;
  };
}

const TradeDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [offerDetails, setOfferDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: trade, isLoading: tradeLoading } = useQuery({
    queryKey: ['trade', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trades')
        .select(`
          *,
          profiles (username)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const { data: offers = [], refetch: refetchOffers } = useQuery({
    queryKey: ['trade-offers', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trade_offers')
        .select(`
          *,
          profiles (username)
        `)
        .eq('trade_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TradeOffer[];
    },
  });

  const handleSubmitOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('trade_offers')
        .insert({
          trade_id: id,
          user_id: user.id,
          offer_details: offerDetails,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your offer has been submitted!",
      });
      setOfferDetails("");
      refetchOffers();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptOffer = async (offerId: string) => {
    try {
      const { error: offerError } = await supabase
        .from('trade_offers')
        .update({ status: 'accepted' })
        .eq('id', offerId);

      if (offerError) throw offerError;

      const { error: tradeError } = await supabase
        .from('trades')
        .update({ status: 'completed' })
        .eq('id', id);

      if (tradeError) throw tradeError;

      toast({
        title: "Success",
        description: "Offer accepted and trade completed!",
      });
      refetchOffers();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  if (tradeLoading) return <div>Loading...</div>;
  if (!trade) return <div>Trade not found</div>;

  const isOwner = user?.id === trade.user_id;
  const canMakeOffer = user && !isOwner && trade.status === 'active';

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 pt-24">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="bg-secondary p-6 rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white">{trade.title}</h1>
                <p className="text-sm text-gray-400">
                  Posted {formatDistanceToNow(new Date(trade.created_at))} ago by{" "}
                  {trade.profiles?.username}
                </p>
              </div>
              <div className="text-sm">
                <span className="px-3 py-1 bg-diablo-600 text-white rounded">
                  {trade.payment_type === 'currency' ? `${trade.price} FG` : 'Item Trade'}
                </span>
              </div>
            </div>
            <p className="text-gray-200 mb-4">{trade.description}</p>
            <div className="text-sm text-gray-400">
              {trade.game} | {trade.platform} | {trade.game_mode} | {trade.ladder_status}
            </div>
          </div>

          {canMakeOffer && (
            <form onSubmit={handleSubmitOffer} className="bg-secondary p-6 rounded-lg space-y-4">
              <h2 className="text-xl font-semibold text-white">Make an Offer</h2>
              <div>
                <Textarea
                  value={offerDetails}
                  onChange={(e) => setOfferDetails(e.target.value)}
                  placeholder="Describe your offer..."
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-diablo-600 hover:bg-diablo-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Offer"}
              </Button>
            </form>
          )}

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Offers ({offers.length})</h2>
            {offers.map((offer) => (
              <div key={offer.id} className="bg-secondary p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm text-gray-400">
                    {offer.profiles?.username} offered{" "}
                    {formatDistanceToNow(new Date(offer.created_at))} ago
                  </p>
                  {offer.status !== 'pending' && (
                    <span className={`px-2 py-1 text-white text-sm rounded ${
                      offer.status === 'accepted' ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                      {offer.status}
                    </span>
                  )}
                </div>
                <p className="text-gray-200">{offer.offer_details}</p>
                {isOwner && trade.status === 'active' && offer.status === 'pending' && (
                  <div className="mt-4 flex gap-2 justify-end">
                    <Button
                      onClick={() => handleAcceptOffer(offer.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Accept Offer
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeDetails;
